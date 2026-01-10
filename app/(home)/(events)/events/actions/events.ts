"use server";

import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function startStream(eventId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    try {
        await db.update(events)
            .set({
                isLive: true,
                updatedAt: new Date(),
            })
            .where(eq(events.id, eventId));

        revalidatePath("/");
        revalidatePath("/events");
        revalidatePath(`/live/${eventId}`);

        return { success: true };
    } catch (error) {
        console.error("Error starting stream:", error);
        return { success: false, error: "Failed to start stream" };
    }
}
