"use server";

import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";
import { createEventSchema } from "./schema";
import { nanoid } from "nanoid";

export async function getEvents() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const userEvents = await db.query.events.findMany({
        where: eq(events.userId, user.id),
        orderBy: [desc(events.startTime)],
    });

    return userEvents;
}

export async function createEvent(values: unknown) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    const validatedFields = createEventSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    const { title, description, startTime, isLive, thumbnailUrl, isShort, hashtags, visibility } = validatedFields.data;

    try {
        await db.insert(events).values({
            id: nanoid(),
            userId: user.id,
            title,
            description,
            startTime: new Date(startTime),
            isLive: isLive || false,
            thumbnailUrl,
            isShort: isShort || false,
            hashtags,
            visibility: visibility || 'public',
            status: "draft",
        });

        revalidatePath("/events");
        return { success: true };
    } catch (error) {
        console.error("Error creating event:", error);
        return { error: "Failed to create event" };
    }
}

export async function updateEvent(id: string, values: unknown) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    const validatedFields = createEventSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    const { title, description, startTime, isLive, thumbnailUrl, isShort, hashtags, visibility } = validatedFields.data;

    try {
        const existingEvent = await db.query.events.findFirst({
            where: eq(events.id, id),
        });

        if (!existingEvent || existingEvent.userId !== user.id) {
            return { error: "Event not found or unauthorized" };
        }

        await db.update(events)
            .set({
                title,
                description,
                startTime: new Date(startTime),
                isLive,
                thumbnailUrl,
                isShort,
                hashtags,
                visibility,
                updatedAt: new Date(),
            })
            .where(eq(events.id, id));

        revalidatePath("/events");
        return { success: true };
    } catch (error) {
        console.error("Error updating event:", error);
        return { error: "Failed to update event" };
    }
}

export async function deleteEvent(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    try {
        const existingEvent = await db.query.events.findFirst({
            where: eq(events.id, id),
        });

        if (!existingEvent || existingEvent.userId !== user.id) {
            return { error: "Event not found or unauthorized" };
        }

        await db.delete(events).where(eq(events.id, id));

        revalidatePath("/events");
        return { success: true };
    } catch (error) {
        console.error("Error deleting event:", error);
        return { error: "Failed to delete event" };
    }
}

export async function publishEvent(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    try {
        const existingEvent = await db.query.events.findFirst({
            where: eq(events.id, id),
        });

        if (!existingEvent || existingEvent.userId !== user.id) {
            return { error: "Event not found or unauthorized" };
        }

        await db.update(events)
            .set({ status: "published", updatedAt: new Date() })
            .where(eq(events.id, id));

        revalidatePath("/events");
        return { success: true };
    } catch (error) {
        console.error("Error publishing event:", error);
        return { error: "Failed to publish event" };
    }
}
