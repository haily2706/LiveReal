"use server";

import { db } from "@/lib/db";
import { cashOuts } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { UserRole } from "@/types/role";

export async function updateCashOutStatus(cashOutId: string, status: number) {
    const supabase = await createClient();

    // Get current user to check permissions
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

    if (userError || !currentUser) {
        throw new Error("Unauthorized");
    }

    const currentRole = currentUser.app_metadata?.role as string | undefined;
    const hasAccess = currentRole && (currentRole === UserRole.ADMIN || currentRole === UserRole.MANAGER);

    if (!hasAccess) {
        throw new Error("Unauthorized: Insufficient permissions");
    }

    try {
        await db
            .update(cashOuts)
            .set({ status })
            .where(eq(cashOuts.id, cashOutId));

        revalidatePath("/dashboard/cash-outs");
        return { success: true };
    } catch (error) {
        console.error("Error updating cash out status:", error);
        throw new Error("Failed to update status");
    }
}
