import { db } from "@/lib/db";
import { cashOuts, users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { transferToken } from "@/lib/hedera/client";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ success: false, error: "Missing transaction ID" }, { status: 400 });
        }

        // Verify the transaction belongs to the user and is strictly in 'Open' (0) status
        // We do not allow cancelling if it's already approved (1), rejected (2) or transferred (3)
        const transaction = await db.query.cashOuts.findFirst({
            where: and(
                eq(cashOuts.id, id),
                eq(cashOuts.userId, user.id)
            )
        });

        if (!transaction) {
            return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
        }

        if (transaction.status !== 0) {
            return NextResponse.json({ success: false, error: "Cannot cancel this transaction. It may have already been processed." }, { status: 400 });
        }

        // Get user's wallet info
        const userRecord = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (!userRecord || !userRecord.hbarAccountId) {
            return NextResponse.json({ success: false, error: "User wallet not found" }, { status: 400 });
        }

        // Refund the amount to user
        const amountToRefund = Number(transaction.amount);
        if (isNaN(amountToRefund) || amountToRefund <= 0) {
            return NextResponse.json({ success: false, error: "Invalid transaction amount" }, { status: 400 });
        }

        const refundResult = await transferToken(
            userRecord.hbarAccountId,
            amountToRefund,
            "Cashout Cancelled - Refund"
        );

        if (refundResult !== 'SUCCESS') {
            return NextResponse.json({ success: false, error: "Failed to refund tokens" }, { status: 500 });
        }

        // Update status to 4 (Cancelled)
        await db
            .update(cashOuts)
            .set({ status: 4, updatedAt: new Date() })
            .where(eq(cashOuts.id, id));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error cancelling cash out:", error);
        return NextResponse.json({ success: false, error: "Failed to cancel transaction" }, { status: 500 });
    }
}
