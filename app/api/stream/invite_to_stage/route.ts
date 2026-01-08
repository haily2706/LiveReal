import {
  InviteToStageParams,
  getSessionFromReq,
  liveKitClient,
} from "@/lib/livekit";


/**
 * @swagger
 * /api/stream/invite_to_stage:
 *   post:
 *     summary: Invite a participant to the stage
 *     tags: [Stream]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identity:
 *                 type: string
 *     responses:
 *       200:
 *         description: Participant invited to stage successfully
 */
export async function POST(req: Request) {

  try {
    const session = getSessionFromReq(req);
    const reqBody = await req.json();
    await liveKitClient.inviteToStage(session, reqBody as InviteToStageParams);

    return Response.json({});
  } catch (err) {
    if (err instanceof Error) {
      return new Response(err.message, { status: 500 });
    }

    return new Response(null, { status: 500 });
  }
}
