import {
    getSessionFromReq,
    liveKitClient,
} from "@/lib/livekit";

/**
 * @swagger
 * /api/stream/unpin_participant:
 *   post:
 *     summary: Unpin a participant from the stage
 *     tags: [Stream]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Participant unpinned successfully
 */
export async function POST(req: Request) {

    try {
        const session = getSessionFromReq(req);
        await liveKitClient.unpinParticipant(session);

        return Response.json({});
    } catch (err) {
        console.log(err);
        if (err instanceof Error) {
            return new Response(err.message, { status: 500 });
        }

        return new Response(null, { status: 500 });
    }
}
