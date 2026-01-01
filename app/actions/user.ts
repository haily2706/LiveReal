"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: {
    name?: string;
    bio?: string;
    location?: string;
    avatar?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    try {
        await db.insert(users)
            .values({
                id: user.id,
                email: user.email!,
                ...data,
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: users.id,
                set: {
                    ...data,
                    updatedAt: new Date(),
                }
            });

        revalidatePath("/events");
        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
}
