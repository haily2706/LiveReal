import { Controller, CreateStreamParams } from "@/app/(home)/stream/lib/controller";


/**
 * @swagger
 * /api/stream/create_stream:
 *   post:
 *     summary: Create a new stream
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
 *               name:
 *                 type: string
 *               metadata:
 *                 type: object
 *                 properties:
 *                   creator_identity:
 *                     type: string
 *                   enable_chat:
 *                     type: boolean
 *                   allow_participation:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Stream created successfully
 */
export async function POST(req: Request) {
  const controller = new Controller();

  try {
    const reqBody = await req.json();
    const response = await controller.createStream(
      reqBody as CreateStreamParams
    );

    return Response.json(response);
  } catch (err) {
    if (err instanceof Error) {
      return new Response(err.message, { status: 500 });
    }

    return new Response(null, { status: 500 });
  }
}
