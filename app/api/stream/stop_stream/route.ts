import { Controller, getSessionFromReq } from "@/app/(home)/stream/lib/controller";


/**
 * @swagger
 * /api/stream/stop_stream:
 *   post:
 *     summary: Stop a stream
 *     tags: [Stream]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Stream stopped successfully
 */
export async function POST(req: Request) {
  const controller = new Controller();

  try {
    const session = getSessionFromReq(req);
    await controller.stopStream(session);

    return Response.json({});
  } catch (err) {
    if (err instanceof Error) {
      return new Response(err.message, { status: 500 });
    }

    return new Response(null, { status: 500 });
  }
}
