import { db } from "@/lib/db";
import { users, transfers } from "@/lib/db/schema";
import { transferTokenFromUser, getAccountBalance } from "@/lib/hedera/client";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";


/**
 * @swagger
 * /api/wallet/transfer:
 *   post:
 *     summary: Transfer funds
 *     description: Transfers funds from the authenticated user's wallet to another user.
 *     tags:
 *       - Wallet
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - recipientId
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to transfer in base units (LREAL)
 *               recipientId:
 *                 type: string
 *                 description: ID of the recipient user
 *     responses:
 *       200:
 *         description: Transfer successful
 *       400:
 *         description: Invalid amount, recipient, or insufficient balance
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error or transfer failed
 */
export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { amount, recipientId } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ success: false, error: "Invalid amount" }, { status: 400 });
        }

        if (!recipientId) {
            return NextResponse.json({ success: false, error: "Invalid recipient" }, { status: 400 });
        }

        // 1. Get sender details (need private key)
        const sender = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (!sender || !sender.hbarAccountId || !sender.hbarPrivateKey) {
            return NextResponse.json({ success: false, error: "Sender wallet not configured" }, { status: 400 });
        }

        // 2. Get recipient details
        const recipient = await db.query.users.findFirst({
            where: eq(users.id, recipientId),
        });

        if (!recipient || !recipient.hbarAccountId) {
            return NextResponse.json({ success: false, error: "Recipient wallet not configured" }, { status: 400 });
        }

        // 3. Check balance
        const balanceData = await getAccountBalance(sender.hbarAccountId);
        const tokenBalance = parseInt(balanceData.tokenBalance);
        const amountInLReal = amount;

        if (tokenBalance < amountInLReal) {
            return NextResponse.json({ success: false, error: "Insufficient balance" }, { status: 400 });
        }

        // 4. Execute Hedera Transfer
        try {
            const hederaResult = await transferTokenFromUser(
                sender.hbarAccountId,
                sender.hbarPrivateKey,
                recipient.hbarAccountId,
                amountInLReal
            );

            if (hederaResult.status !== "SUCCESS") {
                return NextResponse.json({ success: false, error: "Hedera transfer failed" }, { status: 500 });
            }

            // 5. Record Transaction in DB
            const transferId = crypto.randomUUID();

            await db.insert(transfers).values({
                id: transferId,
                fromUserId: user.id,
                toUserId: recipientId,
                amount: amountInLReal.toString(),
                status: 'succeeded',
                transaction: {
                    hederaTransactionId: hederaResult.transactionId,
                    amountUSD: amount,
                    fee: 0,
                    timestamp: new Date().toISOString()
                },
                createdAt: new Date(),
            });

            return NextResponse.json({ success: true });

        } catch (error: any) {
            console.error("Hedera transfer error:", error);
            return NextResponse.json({ success: false, error: error.message || "Failed to execute transfer" }, { status: 500 });
        }

    } catch (error) {
        console.error("Transfer error:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
