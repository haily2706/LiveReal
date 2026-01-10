import { db } from "@/lib/db";
import { cashOuts } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
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
