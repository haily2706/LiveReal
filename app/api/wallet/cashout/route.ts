import { db } from "@/lib/db";
import { users, cashOuts } from "@/lib/db/schema";
import { getAccountBalance } from "@/lib/hedera/client";
import { createClient } from "@/lib/supabase/server";
import { eq, and } from "drizzle-orm";
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

        if (!userRecord || !userRecord.hbarAccountId) {
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
            const amountInLReal = amount;

            if (balance < amountInLReal) {
                return NextResponse.json({ success: false, error: "Insufficient funds" }, { status: 400 });
            }

            // 4. Create cashout request
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
            console.error("Error checking balance:", error);
            return NextResponse.json({ success: false, error: "Failed to verify balance" }, { status: 500 });
        }

    } catch (error) {
        console.error("Error requesting cashout:", error);
        return NextResponse.json({ success: false, error: "Failed to request cashout" }, { status: 500 });
    }
}
