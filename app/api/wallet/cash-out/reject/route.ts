import { db } from "@/lib/db";
import { cashOuts, users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { transferToken } from "@/lib/hedera/client";
import { UserRole } from "@/types/role";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const currentRole = user.app_metadata?.role as string | undefined;
    const hasAccess = currentRole && (currentRole === UserRole.ADMIN || currentRole === UserRole.MANAGER);

    if (!hasAccess) {
        return NextResponse.json({ success: false, error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ success: false, error: "Missing transaction ID" }, { status: 400 });
        }

        const transaction = await db.query.cashOuts.findFirst({
            where: eq(cashOuts.id, id),
        });

        if (!transaction) {
            return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
        }

        // Can reject pending (0) or approved (1) requests. 
        // 2 (Rejected) and 3 (Completed) are final states.
        if ((transaction.status ?? 0) >= 2) {
            return NextResponse.json({ success: false, error: "Transaction has already been finalized" }, { status: 400 });
        }

        // Get user's wallet info to refund
        const userRecord = await db.query.users.findFirst({
            where: eq(users.id, transaction.userId),
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
            "Cashout Rejected - Refund"
        );

        if (refundResult !== 'SUCCESS') {
            return NextResponse.json({ success: false, error: "Failed to refund tokens" }, { status: 500 });
        }

        await db
            .update(cashOuts)
            .set({ status: 2, updatedAt: new Date() })
            .where(eq(cashOuts.id, id));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error rejecting cash out:", error);
        return NextResponse.json({ success: false, error: "Failed to reject transaction" }, { status: 500 });
    }
}
