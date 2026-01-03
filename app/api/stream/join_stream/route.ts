import { Controller, JoinStreamParams } from "@/app/(home)/stream/lib/controller";


/**
 * @swagger
 * /api/stream/join_stream:
 *   post:
 *     summary: Join an existing stream
 *     tags: [Stream]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               room_name:
 *                 type: string
 *               identity:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully joined the stream
 */
export async function POST(req: Request) {
  const controller = new Controller();

  try {
    const reqBody = await req.json();
    const response = await controller.joinStream(reqBody as JoinStreamParams);

    return Response.json(response);
  } catch (err) {
    if (err instanceof Error) {
      return new Response(err.message, { status: 500 });
    }

    return new Response(null, { status: 500 });
  }
}
