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

        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

export async function searchUsers(query: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    if (!query || query.length < 2) {
        return { success: true, data: [] };
    }

    try {
        const results = await db.query.users.findMany({
            where: (users, { or, ilike, and, ne }) => and(
                or(
                    ilike(users.name, `%${query}%`),
                    ilike(users.email, `%${query}%`)
                ),
                ne(users.id, user.id) // Exclude self
            ),
            limit: 5,
            columns: {
                id: true,
                name: true,
                email: true,
                avatar: true,
            }
        });

        return { success: true, data: results };
    } catch (error) {
        console.error("Error searching users:", error);
        return { success: false, error: "Failed to search users" };
    }
}
