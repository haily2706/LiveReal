import { db } from "@/lib/db";
import { users, cashOuts } from "@/lib/db/schema";
import { getAccountBalance, transferTokenFromUser } from "@/lib/hedera/client";
import { createClient } from "@/lib/supabase/server";
import { eq, and, desc } from "drizzle-orm";
import { NextResponse } from "next/server";


/**
 * @swagger
 * /api/wallet/cashout:
 *   post:
 *     summary: Request cashout
 *     description: Creates a new cashout request for the authenticated user.
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
 *               - paymentMethodId
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to cash out
 *               paymentMethodId:
 *                 type: string
 *                 description: ID of the payment method to use (currently not strictly enforced by backend logic but good practice)
 *     responses:
 *       200:
 *         description: Cashout request created successfully
 *       400:
 *         description: Invalid amount, existing pending request, or insufficient funds
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { amount, paymentMethodId } = await req.json();

        // 1. Get user details for Hedera account
        const userRecord = await db.query.users.findFirst({
            where: eq(users.id, user.id),
        });

        if (!userRecord || !userRecord.hbarAccountId || !userRecord.hbarPrivateKey) {
            return NextResponse.json({ success: false, error: "Wallet not found" }, { status: 400 });
        }

        // 2. Check for existing open requests (status = 0)
        const existingRequests = await db.query.cashOuts.findFirst({
            where: and(
                eq(cashOuts.userId, user.id),
                eq(cashOuts.status, 0)
            )
        });

        if (existingRequests) {
            return NextResponse.json({ success: false, error: "You already have a pending cashout request." }, { status: 400 });
        }

        // 3. Check user balance
        try {
            const balances = await getAccountBalance(userRecord.hbarAccountId);
            const balance = Number(balances.tokenBalance);

            // Amount requested is in LREAL (base units)
            const amountInLReal = Number(amount);

            if (isNaN(amountInLReal) || amountInLReal <= 0) {
                return NextResponse.json({ success: false, error: "Invalid amount" }, { status: 400 });
            }

            if (balance < amountInLReal) {
                return NextResponse.json({ success: false, error: "Insufficient funds" }, { status: 400 });
            }

            // 4. Transfer LREAL from User to System (Treasury)
            const systemAccountId = process.env.HEDERA_ACCOUNT_ID;
            if (!systemAccountId) {
                console.error("Missing HEDERA_ACCOUNT_ID");
                return NextResponse.json({ success: false, error: "System configuration error" }, { status: 500 });
            }

            const transferResult = await transferTokenFromUser(
                userRecord.hbarAccountId,
                userRecord.hbarPrivateKey,
                systemAccountId,
                amountInLReal,
                "Cashout Request"
            );

            if (transferResult.status !== 'SUCCESS') {
                return NextResponse.json({ success: false, error: "Failed to transfer funds" }, { status: 500 });
            }

            // 5. Create cashout request
            await db.insert(cashOuts).values({
                id: crypto.randomUUID(),
                userId: user.id,
                amount: amountInLReal.toString(),
                status: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            return NextResponse.json({ success: true });

        } catch (error) {
            console.error("Error processing cashout:", error);
            return NextResponse.json({ success: false, error: "Failed to process cashout" }, { status: 500 });
        }

    } catch (error) {
        console.error("Error requesting cashout:", error);
        return NextResponse.json({ success: false, error: "Failed to request cashout" }, { status: 500 });
    }
}

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const transactions = await db.query.cashOuts.findMany({
            where: eq(cashOuts.userId, user.id),
            orderBy: [desc(cashOuts.createdAt)],
            limit: 10,
        });
        return NextResponse.json({ success: true, data: transactions });
    } catch (error) {
        console.error("Error fetching cash out transactions:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 });
    }
}
