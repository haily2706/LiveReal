import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { mediaClient } from "@/lib/media.client";

export async function GET() {
    try {
        const liveEvents = await db.query.events.findMany({
            where: eq(events.isLive, true),
            with: {
                user: true,
            },
            orderBy: [desc(events.createdAt)],
        });

        const data = liveEvents.map(event => {
            const avatarUrl = mediaClient.getAvatarUrl(event.user.id, event.user.avatar || false);
            return {
                ...event,
                user: {
                    ...event.user,
                    avatar: avatarUrl
                }
            };
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching live events:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch live events" }, { status: 500 });
    }
}
