import { db } from "@/lib/db";
import { users, transfers } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { transferTokenFromUser, getAccountBalance } from "@/lib/hedera/client";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";


/**
 * @swagger
 * /api/wallet/transfers:
 *   get:
 *     summary: Get wallet transfers
 *     description: Retrieves the list of recent P2P transfers (sent and received) for the user.
 *     tags:
 *       - Wallet
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of transfers
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch transfers
 */
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const sentTransfers = await db.query.transfers.findMany({
            where: eq(transfers.fromUserId, user.id),
            orderBy: [desc(transfers.createdAt)],
        });

        const receivedTransfers = await db.query.transfers.findMany({
            where: eq(transfers.toUserId, user.id),
            orderBy: [desc(transfers.createdAt)],
        });

        const allTransfers = [...sentTransfers, ...receivedTransfers].sort((a, b) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );

        // Fetch user details manually
        const userIds = new Set<string>();
        allTransfers.forEach(tx => {
            if (tx.fromUserId !== user.id) userIds.add(tx.fromUserId);
            if (tx.toUserId !== user.id) userIds.add(tx.toUserId);
        });

        let usersMap: Record<string, any> = {};

        if (userIds.size > 0) {
            const usersList = await db.query.users.findMany({
                where: (users, { inArray }) => inArray(users.id, Array.from(userIds)),
                columns: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                }
            });

            usersList.forEach(u => {
                usersMap[u.id] = u;
            });
        }

        const data = allTransfers.map(tx => ({
            ...tx,
            fromUser: tx.fromUserId === user.id ? { id: user.id } : usersMap[tx.fromUserId],
            toUser: tx.toUserId === user.id ? { id: user.id } : usersMap[tx.toUserId]
        }));

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error("Error fetching transfers:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch transfers" }, { status: 500 });
    }
}

/**
 * @swagger
 * /api/wallet/transfers:
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
