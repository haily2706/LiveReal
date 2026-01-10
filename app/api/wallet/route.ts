import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createUserAccount } from '@/lib/hedera/client';

/**
 * @swagger
 * /api/wallet:
 *   get:
 *     summary: Initialize User Wallet
 *     description: Checks for existing Hedera wallet or creates a new one for the authenticated user.
 *     tags:
 *       - Wallet
 *     responses:
 *       200:
 *         description: Wallet details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accountId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [existing, created]
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found in database
 *       500:
 *         description: Internal Error or Wallet creation failed
 */
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Check if user exists in DB and has wallet
        const [dbUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, user.id));

        if (!dbUser) {
            return new NextResponse('User not found in database', { status: 404 });
        }

        if (dbUser.hbarAccountId) {
            // Already has account
            return NextResponse.json({
                accountId: dbUser.hbarAccountId,
                status: 'existing'
            });
        }

        // Create new Hedera account
        console.log(`Creating Hedera account for user ${user.id}...`);
        try {
            const hbarAccount = await createUserAccount();

            // Store in DB
            await db.update(users)
                .set({
                    hbarAccountId: hbarAccount.accountId,
                    hbarPrivateKey: hbarAccount.privateKey,
                })
                .where(eq(users.id, user.id));

            console.log(`Hedera account created for user ${user.id}: ${hbarAccount.accountId}`);

            return NextResponse.json({
                accountId: hbarAccount.accountId,
                status: 'created'
            });

        } catch (error: any) {
            console.error('Failed to create Hedera account:', error);
            // Don't fail the request completely if we can't create wallet right now, 
            // maybe return error so client knows to retry?
            // User side, we might just want to suppress for now or show "Wallet creation failed"
            return new NextResponse(`Wallet creation failed: ${error.message}`, { status: 500 });
        }

    } catch (error: any) {
        console.error('[WALLET_INIT]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
