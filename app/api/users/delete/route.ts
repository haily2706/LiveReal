import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const supabaseAdmin = createAdminClient();

        // Delete user
        const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (error) {
            console.error(error);
            return new NextResponse("Error deleting user", { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log("[USER_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
