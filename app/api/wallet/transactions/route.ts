
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { cashIns } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     summary: Get wallet transactions
 *     description: Retrieves the list of recent transactions (cash-ins) for the authenticated user's wallet.
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
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   status:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Error
 */
export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const transactions = await db
            .select()
            .from(cashIns)
            .where(eq(cashIns.userId, user.id))
            .orderBy(desc(cashIns.createdAt))
            .limit(10);

        return NextResponse.json(transactions);
    } catch (error) {
        console.log("[WALLET_TRANSACTIONS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
