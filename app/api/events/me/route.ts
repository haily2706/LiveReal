import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userEvents = await db.query.events.findMany({
            where: eq(events.userId, user.id),
            orderBy: [desc(events.createdAt)],
        });

        return NextResponse.json({ success: true, data: userEvents });
    } catch (error) {
        console.error("Error fetching user events:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch events" }, { status: 500 });
    }
}
