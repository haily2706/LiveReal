import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * @swagger
 * /api/users/delete:
 *   delete:
 *     summary: Delete current user
 *     description: Deletes the currently authenticated user's account using admin privileges.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error deleting user or Internal Error
 */
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
