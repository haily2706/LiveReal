import { db } from "@/lib/db";
import { cashIns } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/wallet/cash-in:
 *   get:
 *     summary: Get wallet cash-in transactions
 *     description: Retrieves the list of recent cash-in transactions for the authenticated user's wallet.
 *     tags:
 *       - Wallet
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Error
 */
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const transactions = await db.query.cashIns.findMany({
            where: eq(cashIns.userId, user.id),
            orderBy: [desc(cashIns.createdAt)],
            limit: 10,
        });
        return NextResponse.json({ success: true, data: transactions });
    } catch (error) {
        console.error("Error fetching cash in transactions:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 });
    }
}
