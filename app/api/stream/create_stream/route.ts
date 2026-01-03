import { Controller, CreateStreamParams } from "@/app/(home)/stream/lib/controller";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";


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
    const params = reqBody as CreateStreamParams;

    const response = await controller.createStream(params);

    if (params.room_name) {
      await db.update(events)
        .set({
          isLive: true
        })
        .where(eq(events.id, params.room_name));
    }

    return Response.json(response);
  } catch (err) {
    if (err instanceof Error) {
      return new Response(err.message, { status: 500 });
    }

    return new Response(null, { status: 500 });
  }
}
