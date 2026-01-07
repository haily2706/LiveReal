import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        await db.delete(events)
            .where(and(eq(events.id, id), eq(events.userId, user.id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting event:", error);
        return NextResponse.json({ success: false, error: "Failed to delete event" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        const updateData: any = {
            updatedAt: new Date(),
        };

        if (body.title !== undefined) updateData.title = body.title;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.eventType !== undefined) updateData.type = body.eventType;
        if (body.startTime !== undefined) updateData.startTime = new Date(body.startTime);
        if (body.thumbnailUrl !== undefined) updateData.thumbnailUrl = body.thumbnailUrl;
        if (body.isShort !== undefined) updateData.isShort = body.isShort;
        if (body.visibility !== undefined) updateData.visibility = body.visibility;
        if (body.invitedUsers !== undefined) updateData.invitedUsers = body.invitedUsers;

        const [updatedEvent] = await db.update(events)
            .set(updateData)
            .where(and(eq(events.id, id), eq(events.userId, user.id)))
            .returning();

        return NextResponse.json({ success: true, data: updatedEvent });
    } catch (error) {
        console.error("Error updating event:", error);
        return NextResponse.json({ success: false, error: "Failed to update event" }, { status: 500 });
    }
}
