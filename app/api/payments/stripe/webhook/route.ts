import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import {
    handleCheckoutSessionCompleted,
    handleInvoicePaymentSucceeded,
    handleSubscriptionUpdatedOrDeleted
} from "./handlers";

/**
 * @swagger
 * /api/payments/stripe/webhook:
 *   post:
 *     summary: Stripe Webhook Handler
 *     description: Processes incoming Stripe webhook events for checkout sessions, invoices, and subscriptions.
 *     tags:
 *       - Payments
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Webhook Error or Client Error
 *       500:
 *         description: Internal Server Error
 */
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

    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
                break;
            case "invoice.payment_succeeded":
                await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
                break;
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
                await handleSubscriptionUpdatedOrDeleted(event.data.object as Stripe.Subscription);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error: any) {
        console.error(`Error processing webhook event ${event.type}:`, error);

        const clientErrors = [
            "User id is required",
            "Invalid Plan",
            "User Hedera Account Not Found"
        ];

        if (clientErrors.includes(error.message)) {
            return new NextResponse(error.message, { status: 400 });
        }

        return new NextResponse("Internal Server Error", { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
