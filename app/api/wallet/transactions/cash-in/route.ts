import { db } from "@/lib/db";
import { cashIns } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const transactions = await db.query.cashIns.findMany({
            where: eq(cashIns.userId, user.id),
            orderBy: [desc(cashIns.createdAt)],
            limit: 10,
        });
        return NextResponse.json({ success: true, data: transactions });
    } catch (error) {
        console.error("Error fetching cash in transactions:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 });
    }
}
