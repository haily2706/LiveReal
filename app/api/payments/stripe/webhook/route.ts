import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;


    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        if (!session?.metadata?.userId) {
            return new NextResponse("User id is required", { status: 400 });
        }

        await db.insert(subscriptions).values({
            id: subscription.id,
            userId: session.metadata.userId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            planId: session.metadata.planId,
            stripeCurrentPeriodEnd: subscription.items.data[0].current_period_end ? new Date(subscription.items.data[0].current_period_end * 1000) : null,
        });
    }

    if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = await stripe.subscriptions.retrieve(
            (invoice as any).subscription as string
        );

        await db
            .update(subscriptions)
            .set({
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: subscription.items.data[0].current_period_end ? new Date(subscription.items.data[0].current_period_end * 1000) : null,
                planId: subscription.metadata.planId,
            })
            .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
    }

    if (
        event.type === "customer.subscription.updated" ||
        event.type === "customer.subscription.deleted"
    ) {
        const subscription = event.data.object as Stripe.Subscription;

        await db
            .update(subscriptions)
            .set({
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: subscription.items.data[0].current_period_end ? new Date(subscription.items.data[0].current_period_end * 1000) : null,
                planId: subscription.metadata.planId,
            })
            .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
    }

    return new NextResponse(null, { status: 200 });
}
