import { db } from "@/lib/db";
import { transfers } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";


/**
 * @swagger
 * /api/wallet/transfers:
 *   get:
 *     summary: Get wallet transfers
 *     description: Retrieves the list of recent P2P transfers (sent and received) for the user.
 *     tags:
 *       - Wallet
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of transfers
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch transfers
 */
export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const sentTransfers = await db.query.transfers.findMany({
            where: eq(transfers.fromUserId, user.id),
            orderBy: [desc(transfers.createdAt)],
        });

        const receivedTransfers = await db.query.transfers.findMany({
            where: eq(transfers.toUserId, user.id),
            orderBy: [desc(transfers.createdAt)],
        });

        const allTransfers = [...sentTransfers, ...receivedTransfers].sort((a, b) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );

        // Fetch user details manually
        const userIds = new Set<string>();
        allTransfers.forEach(tx => {
            if (tx.fromUserId !== user.id) userIds.add(tx.fromUserId);
            if (tx.toUserId !== user.id) userIds.add(tx.toUserId);
        });

        let usersMap: Record<string, any> = {};

        if (userIds.size > 0) {
            const usersList = await db.query.users.findMany({
                where: (users, { inArray }) => inArray(users.id, Array.from(userIds)),
                columns: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                }
            });

            usersList.forEach(u => {
                usersMap[u.id] = u;
            });
        }

        const data = allTransfers.map(tx => ({
            ...tx,
            fromUser: tx.fromUserId === user.id ? { id: user.id } : usersMap[tx.fromUserId],
            toUser: tx.toUserId === user.id ? { id: user.id } : usersMap[tx.toUserId]
        }));

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error("Error fetching transfers:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch transfers" }, { status: 500 });
    }
}
