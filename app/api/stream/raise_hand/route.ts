import { Controller, getSessionFromReq } from "@/app/(home)/stream/lib/controller";

// TODO: validate request with Zod

export async function POST(req: Request) {
  const controller = new Controller();

  try {
    const session = getSessionFromReq(req);
    console.log('[raise_hand] Session:', session);
    await controller.raiseHand(session);

    return Response.json({});
  } catch (err) {
    console.error('[raise_hand] Error:', err);
    if (err instanceof Error) {
      return new Response(err.message, { status: 500 });
    }

    return new Response(null, { status: 500 });
  }
}
