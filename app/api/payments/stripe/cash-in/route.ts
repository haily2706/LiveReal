
import { NextRequest, NextResponse } from "next/server";
import { absoluteUrl } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CASH_IN_PLANS } from "@/app/(home)/settings/wallet/constants";

/**
 * @swagger
 * /api/payments/stripe/cash-in:
 *   post:
 *     summary: Create Cash-In Checkout Session
 *     description: Creates a Stripe checkout session for a one-time LREAL purchase.
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planId:
 *                 type: string
 *                 description: The ID of the cash-in plan
 *     responses:
 *       200:
 *         description: Checkout URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *       400:
 *         description: Invalid Plan
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Error
 */
export async function POST(req: NextRequest) {
    try {
        const { planId } = await req.json();
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const [userSubscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, user.id));

        const cashInPlan = CASH_IN_PLANS.find((p) => p.id === planId);

        if (!cashInPlan) {
            return new NextResponse("Invalid Plan", { status: 400 });
        }

        const line_item = {
            price_data: {
                currency: cashInPlan.currency,
                product_data: {
                    name: cashInPlan.name,
                    description: cashInPlan.description,
                },
                unit_amount: cashInPlan.price * 100, // Stripe expects amounts in cents
            },
            quantity: 1,
        };

        let stripeSession;
        // In cash-in, success url redirects back to wallet
        const successUrl = absoluteUrl(`/settings/wallet?success=true`);
        const cancelUrl = absoluteUrl("/settings/wallet");


        stripeSession = await stripe.checkout.sessions.create({
            success_url: successUrl,
            cancel_url: cancelUrl,
            payment_method_types: ["card"],
            mode: "payment",
            billing_address_collection: "auto",
            customer_email: user.email,
            line_items: [line_item],
            metadata: {
                userId: user.id,
                planId,
                type: "cash_in",
            },
        });


        return NextResponse.json({ url: stripeSession.url });
    } catch (error) {
        console.log("[STRIPE_CASH_IN]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
