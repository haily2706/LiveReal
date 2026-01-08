import { CreateIngressParams, liveKitClient } from "@/lib/livekit";

/**
 * @swagger
 * /api/stream/create_ingress:
 *   post:
 *     summary: Create a new ingress (RTMP/WHIP)
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
 *               ingress_type:
 *                 type: string
 *                 enum: [rtmp, whip]
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
 *         description: Ingress created successfully
 */
export async function POST(req: Request) {

  try {
    const reqBody = await req.json();
    const response = await liveKitClient.createIngress(
      reqBody as CreateIngressParams
    );

    return Response.json(response);
  } catch (err) {
    console.log(err);

    if (err instanceof Error) {
      return new Response(err.message, { status: 500 });
    }

    return new Response(null, { status: 500 });
  }
}
