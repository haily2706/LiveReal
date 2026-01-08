import { getSessionFromReq, liveKitClient } from "@/lib/livekit";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { log } from "console";
import { eq } from "drizzle-orm";


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
  const body = await req.json();
  let session;
  try {
    session = getSessionFromReq(req);
    console.log("Session: ", session?.room_name);
    if (body.force) {
      await liveKitClient.stopStream(session);
    }

    return Response.json({});
  } catch (err) {
    // if (err instanceof Error) {
    //   return new Response(err.message, { status: 500 });
    // }

    // return new Response(null, { status: 500 });
    return Response.json({});
  } finally {
    if (session?.room_name) {
      // Update event status in database
      await db.update(events)
        .set({
          isLive: false,
          endTime: new Date()
        })
        .where(eq(events.id, session.room_name));
    }
  }
}
