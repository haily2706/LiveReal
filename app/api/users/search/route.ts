import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { and, ilike, ne, or } from "drizzle-orm";

export async function GET(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
        return NextResponse.json({ success: true, data: [] });
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

        return NextResponse.json({ success: true, data: results });
    } catch (error) {
        console.error("Error searching users:", error);
        return NextResponse.json({ success: false, error: "Failed to search users" }, { status: 500 });
    }
}
