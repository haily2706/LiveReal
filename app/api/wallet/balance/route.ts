import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createUserAccount, getAccountBalance } from '@/lib/hedera/client';

export const dynamic = 'force-dynamic';

/**
 * @swagger
 * /api/wallet/balance:
 *   get:
 *     summary: Get Wallet Balance
 *     description: Retrieves HBAR and token balances for the user's wallet. Automatically creates a wallet if one does not exist for the user.
 *     tags:
 *       - Wallet
 *     responses:
 *       200:
 *         description: Wallet balance details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accountId:
 *                   type: string
 *                 hbarBalance:
 *                   type: string
 *                 tokenBalance:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found in database
 *       500:
 *         description: Internal Error
 */
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Get DB user
        const [dbUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id));

        if (!dbUser) {
            return new NextResponse('User not found in database', { status: 404 });
        }

        let accountId = dbUser.hbarAccountId;

        // Create wallet if it doesn't exist
        if (!accountId) {
            console.log(`[BALANCE] User ${user.id} has no wallet. Creating one...`);
            try {
                const hbarAccount = await createUserAccount();
                accountId = hbarAccount.accountId;

                // Update DB
                await db.update(users)
                    .set({
                        hbarAccountId: hbarAccount.accountId,
                        hbarPrivateKey: hbarAccount.privateKey,
                    })
                    .where(eq(users.id, user.id));

                console.log(`[BALANCE] Created wallet ${accountId} for user ${user.id}`);
            } catch (createError: any) {
                console.error('[BALANCE] Failed to create wallet:', createError);
                return new NextResponse(`Failed to create wallet: ${createError.message}`, { status: 500 });
            }
        }

        // Fetch balance
        try {
            const balances = await getAccountBalance(accountId!);
            return NextResponse.json({
                userId: user.id,
                accountId: accountId,
                hbarBalance: balances.hbarBalance,
                tokenBalance: balances.tokenBalance
            });
        } catch (error: any) {
            console.error('[BALANCE] Failed to fetch balance:', error);
            return new NextResponse(`Failed to fetch balance: ${error.message}`, { status: 500 });
        }

    } catch (error: any) {
        console.error('[WALLET_BALANCE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
