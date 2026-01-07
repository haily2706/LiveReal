import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const liveEvents = await db.query.events.findMany({
            where: eq(events.isLive, true),
            with: {
                user: true,
            },
            orderBy: [desc(events.createdAt)],
        });

        return NextResponse.json({ success: true, data: liveEvents });
    } catch (error) {
        console.error("Error fetching live events:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch live events" }, { status: 500 });
    }
}
