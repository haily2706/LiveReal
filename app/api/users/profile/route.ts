import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PATCH(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, bio, location, avatar } = body;

        await db.insert(users)
            .values({
                id: user.id,
                email: user.email!,
                name,
                bio,
                location,
                avatar,
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: users.id,
                set: {
                    name,
                    bio,
                    location,
                    avatar,
                    updatedAt: new Date(),
                }
            });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
    }
}
