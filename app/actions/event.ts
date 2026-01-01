"use server";

import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { desc, eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function createEvent(inputs: {
    title: string;
    description?: string;
    eventType: number; // Changed from 'type' to match UI, will map to DB 'type'
    startTime?: Date;
    thumbnailUrl?: string;
    isShort?: boolean;
    visibility?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const [newEvent] = await db.insert(events).values({
            id: nanoid(),
            userId: user.id,
            title: inputs.title,
            description: inputs.description,
            type: inputs.eventType,
            startTime: inputs.startTime || new Date(),
            thumbnailUrl: inputs.thumbnailUrl,
            isShort: inputs.isShort,
            visibility: inputs.visibility || 'public',
            status: 'published', // Default to published for now
        }).returning();

        return { success: true, data: newEvent };
    } catch (error) {
        console.error("Error creating event:", error);
        return { success: false, error: "Failed to create event" };
    }
}


export async function getUserEvents() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const userEvents = await db.query.events.findMany({
            where: eq(events.userId, user.id),
            orderBy: [desc(events.createdAt)],
        });

        return { success: true, data: userEvents };
    } catch (error) {
        console.error("Error fetching user events:", error);
        return { success: false, error: "Failed to fetch events" };
    }
}

export async function deleteEvent(eventId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await db.delete(events)
            .where(and(eq(events.id, eventId), eq(events.userId, user.id)));

        return { success: true };
    } catch (error) {
        console.error("Error deleting event:", error);
        return { success: false, error: "Failed to delete event" };
    }
}

export async function updateEvent(eventId: string, inputs: {
    title?: string;
    description?: string;
    eventType?: number;
    startTime?: Date;
    thumbnailUrl?: string;
    isShort?: boolean;
    visibility?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const updateData: any = {
            updatedAt: new Date(),
        };

        if (inputs.title !== undefined) updateData.title = inputs.title;
        if (inputs.description !== undefined) updateData.description = inputs.description;
        if (inputs.eventType !== undefined) updateData.type = inputs.eventType;
        if (inputs.startTime !== undefined) updateData.startTime = inputs.startTime;
        if (inputs.thumbnailUrl !== undefined) updateData.thumbnailUrl = inputs.thumbnailUrl;
        if (inputs.isShort !== undefined) updateData.isShort = inputs.isShort;
        if (inputs.visibility !== undefined) updateData.visibility = inputs.visibility;

        const [updatedEvent] = await db.update(events)
            .set(updateData)
            .where(and(eq(events.id, eventId), eq(events.userId, user.id)))
            .returning();

        return { success: true, data: updatedEvent };
    } catch (error) {
        console.error("Error updating event:", error);
        return { success: false, error: "Failed to update event" };
    }
}
