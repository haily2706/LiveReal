import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { mediaClient } from "@/lib/media.client";

export async function GET(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    try {
        const foundUser = await db.query.users.findFirst({
            where: eq(users.email, email),
            columns: {
                id: true,
                name: true,
                email: true,
                avatar: true,
            }
        });

        if (foundUser?.id === user.id) {
            return NextResponse.json({ success: false, error: "Cannot transfer to self" }, { status: 400 });
        }

        let userWithAvatar = null;
        if (foundUser) {
            const avatarUrl = mediaClient.getAvatarUrl(foundUser.id, foundUser.avatar || false);
            userWithAvatar = { ...foundUser, avatar: avatarUrl };
        }

        return NextResponse.json({ success: true, data: userWithAvatar });
    } catch (error) {
        console.error("Error searching user:", error);
        return NextResponse.json({ success: false, error: "Failed to search user" }, { status: 500 });
    }
}
