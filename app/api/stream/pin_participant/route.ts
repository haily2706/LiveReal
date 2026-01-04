import {
    Controller,
    PinParticipantParams,
    getSessionFromReq,
} from "@/app/(home)/stream/lib/controller";

/**
 * @swagger
 * /api/stream/pin_participant:
 *   post:
 *     summary: Pin a participant to the stage
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
 *         description: Participant pinned successfully
 */
export async function POST(req: Request) {
    const controller = new Controller();

    try {
        const session = getSessionFromReq(req);
        const reqBody = await req.json();
        await controller.pinParticipant(session, reqBody as PinParticipantParams);

        return Response.json({});
    } catch (err) {
        console.log(err);
        if (err instanceof Error) {
            return new Response(err.message, { status: 500 });
        }

        return new Response(null, { status: 500 });
    }
}
