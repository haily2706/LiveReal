
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { users, transfers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { transferTokenFromUser } from '@/lib/hedera/client';
import { RoomServiceClient, DataPacket_Kind } from 'livekit-server-sdk';
import { nanoid } from 'nanoid';
import { Gift } from '@/app/(landing)/components/gift-gallery';
import { NextRequest, NextResponse } from 'next/server';

const LIVEKIT_API_URL = process.env.LIVEKIT_API_URL;
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;


/**
 * @swagger
 * /api/gifts/send_gift:
 *   post:
 *     summary: Send a gift to a host
 *     description: Transfers tokens from the sender's wallet to the host's wallet and sends a notification to the room.
 *     tags:
 *       - Gifts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gift
 *               - roomId
 *               - hostId
 *             properties:
 *               gift:
 *                 type: object
 *                 properties:
 *                   coins:
 *                     type: number
 *                   name:
 *                     type: string
 *               roomId:
 *                 type: string
 *               hostId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gift sent successfully
 *       400:
 *         description: Missing required fields or wallet not configured
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Sender or Host not found
 *       500:
 *         description: Internal server error or transfer failed
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { gift, roomId, hostId }: { gift: Gift, roomId: string, hostId: string } = body;

        if (!gift || !roomId || !hostId) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        // 1. Authenticate User
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const senderId = user.id;

        // 2. Fetch Sender and Host Data
        const [sender] = await db.select().from(users).where(eq(users.id, senderId));
        const [host] = await db.select().from(users).where(eq(users.id, hostId));

        if (!sender) return NextResponse.json({ success: false, message: 'Sender not found' }, { status: 404 });
        if (!host) return NextResponse.json({ success: false, message: 'Host not found' }, { status: 404 });

        if (!sender.hbarAccountId || !sender.hbarPrivateKey) {
            return NextResponse.json({ success: false, message: 'Sender wallet not configured' }, { status: 400 });
        }
        if (!host.hbarAccountId) {
            return NextResponse.json({ success: false, message: 'Host wallet not configured' }, { status: 400 });
        }

        // 3. Execute Hedera Transfer
        console.log(`[GIFT] Sending ${gift.coins} from ${sender.hbarAccountId} to ${host.hbarAccountId}`);

        try {
            const transferResult = await transferTokenFromUser(
                sender.hbarAccountId,
                sender.hbarPrivateKey,
                host.hbarAccountId,
                gift.coins
            );

            if (transferResult.status !== 'SUCCESS') {
                return NextResponse.json({ success: false, message: `Transfer failed: ${transferResult.status}` }, { status: 500 });
            }

            // 4. Log Transaction
            await db.insert(transfers).values({
                id: nanoid(),
                fromUserId: senderId,
                toUserId: hostId,
                amount: gift.coins.toString(),
                status: 'completed',
                transaction: transferResult,
            });

            // 5. Send LiveKit Data
            if (LIVEKIT_API_URL && LIVEKIT_API_KEY && LIVEKIT_API_SECRET) {
                const roomService = new RoomServiceClient(LIVEKIT_API_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

                const payload = JSON.stringify({
                    type: 'GIFT_RECEIVED',
                    data: {
                        gift: gift,
                        sender: {
                            id: sender.id,
                            name: sender.name || 'Anonymous',
                            avatar: sender.avatar,
                        },
                        timestamp: Date.now(),
                    }
                });

                const encoder = new TextEncoder();
                const data = encoder.encode(payload);

                await roomService.sendData(
                    roomId,
                    data,
                    DataPacket_Kind.RELIABLE,
                    { topic: "gifts", destinationIdentities: [hostId] }
                );
                console.log(`[GIFT] Sent data packet to room ${roomId}`);
            } else {
                console.warn('[GIFT] LiveKit credentials missing, skipping data packet');
            }

            return NextResponse.json({
                success: true,
                message: 'Gift sent successfully',
                transactionId: transferResult.transactionId
            });

        } catch (error: any) {
            console.error('[GIFT] Transfer error:', error);
            return NextResponse.json({ success: false, message: `Transfer error: ${error.message}` }, { status: 500 });
        }

    } catch (error: any) {
        console.error('[GIFT] Unexpected error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
