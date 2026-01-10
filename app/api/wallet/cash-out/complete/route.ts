import { db } from "@/lib/db";
import { cashOuts } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/types/role";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const currentRole = user.app_metadata?.role as string | undefined;
    const hasAccess = currentRole && (currentRole === UserRole.ADMIN || currentRole === UserRole.MANAGER);

    if (!hasAccess) {
        return NextResponse.json({ success: false, error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ success: false, error: "Missing transaction ID" }, { status: 400 });
        }

        const transaction = await db.query.cashOuts.findFirst({
            where: eq(cashOuts.id, id),
        });

        if (!transaction) {
            return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
        }

        // Can complete pending (0) or approved (1) requests.
        if ((transaction.status ?? 0) >= 2) {
            return NextResponse.json({ success: false, error: "Transaction has already been finalized" }, { status: 400 });
        }

        await db
            .update(cashOuts)
            .set({ status: 3, updatedAt: new Date() })
            .where(eq(cashOuts.id, id));

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error completing cash out:", error);
        return NextResponse.json({ success: false, error: "Failed to complete transaction" }, { status: 500 });
    }
}
