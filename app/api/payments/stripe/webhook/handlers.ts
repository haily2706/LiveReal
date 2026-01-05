
import { db } from "@/lib/db";
import { subscriptions, cashIns, users } from "@/lib/db/schema";
import { transferToken } from "@/lib/hedera/client";
import { CASH_IN_PLANS } from "@/app/(home)/events/wallet/constants";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    if (!session?.metadata?.userId) {
        throw new Error("User id is required");
    }

    const isCashIn = session.metadata.type === "cash_in";

    if (isCashIn) {
        await handleCashIn(session);
    } else {
        await handleNewSubscription(session);
    }
}

async function handleCashIn(session: Stripe.Checkout.Session) {
    const planId = session.metadata!.planId;
    const cashInPlan = CASH_IN_PLANS.find((p) => p.id === planId);

    if (!cashInPlan) {
        console.error("Cash in plan not found", planId);
        throw new Error("Invalid Plan");
    }

    // Get user's Hedera Account ID
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.metadata!.userId));

    if (!user || !user.hbarAccountId) {
        console.error("User Has No Hedera Account", session.metadata!.userId);
        throw new Error("User Hedera Account Not Found");
    }

    try {
        // Execute Transfer
        await transferToken(user.hbarAccountId, cashInPlan.lrealAmount);
        console.log(`Transferred ${cashInPlan.lrealAmount} LREAL to ${user.hbarAccountId}`);

        await db.insert(cashIns).values({
            id: session.id,
            userId: session.metadata!.userId,
            stripeCustomerId: session.customer as string,
            stripePaymentIntentId: session.payment_intent as string,
            amount: session.amount_total?.toString() || "0",
            currency: session.currency || "usd",
            status: "succeeded",
        });
    } catch (error) {
        console.error("Hedera Transfer Failed", error);

        await db.insert(cashIns).values({
            id: session.id,
            userId: session.metadata!.userId,
            stripeCustomerId: session.customer as string,
            stripePaymentIntentId: session.payment_intent as string,
            amount: session.amount_total?.toString() || "0",
            currency: session.currency || "usd",
            status: "failed",
        });

        throw error; // Re-throw to ensure the webhook acknowledges failure if needed, though usually we might want to return 200 if we recorded the failure.
        // However, the original code returned 500. Let's stick to throwing so the caller can decide.
    }
}

async function handleNewSubscription(session: Stripe.Checkout.Session) {
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    await db.insert(subscriptions).values({
        id: subscription.id,
        userId: session.metadata!.userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        planId: session.metadata!.planId,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        stripeCurrentPeriodEnd: subscription.items.data[0].current_period_end
            ? new Date(subscription.items.data[0].current_period_end * 1000)
            : null,
    });
}


export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as any).subscription as string;
    if (!subscriptionId) return; // Might be one-off invoice

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await syncSubscription(subscription);
}

export async function handleSubscriptionUpdatedOrDeleted(subscription: Stripe.Subscription) {
    await syncSubscription(subscription);
}

async function syncSubscription(subscription: Stripe.Subscription) {
    await db
        .update(subscriptions)
        .set({
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: subscription.items.data[0].current_period_end
                ? new Date(subscription.items.data[0].current_period_end * 1000)
                : null,
            planId: subscription.metadata.planId,
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}
