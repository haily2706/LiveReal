import { getSessionFromReq, liveKitClient } from "@/lib/livekit";


/**
 * @swagger
 * /api/stream/raise_hand:
 *   post:
 *     summary: Raise hand to join the stage
 *     tags: [Stream]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Hand raised successfully
 */
export async function POST(req: Request) {

  try {
    const session = getSessionFromReq(req);
    console.log('[raise_hand] Session:', session);
    await liveKitClient.raiseHand(session);

    return Response.json({});
  } catch (err) {
    console.error('[raise_hand] Error:', err);
    if (err instanceof Error) {
      return new Response(err.message, { status: 500 });
    }

    return new Response(null, { status: 500 });
  }
}
