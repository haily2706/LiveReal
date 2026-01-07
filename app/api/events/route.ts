import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, description, eventType, startTime, thumbnailUrl, isShort, visibility, invitedUsers } = body;

        const [newEvent] = await db.insert(events).values({
            id: nanoid(),
            userId: user.id,
            title,
            description,
            type: eventType,
            startTime: startTime ? new Date(startTime) : new Date(),
            thumbnailUrl,
            isShort,
            visibility: visibility || 'public',
            invitedUsers,
        }).returning();

        return NextResponse.json({ success: true, data: newEvent });
    } catch (error) {
        console.error("Error creating event:", error);
        return NextResponse.json({ success: false, error: "Failed to create event" }, { status: 500 });
    }
}
