import { db } from "@/lib/db";
import { transfers, users } from "@/lib/db/schema";
import { desc, sql, inArray } from "drizzle-orm";
import { TransfersTable, TransferData } from "./components/transfers-table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DollarSign, Activity, ArrowRightLeft } from "lucide-react";
import { mediaClient } from "@/lib/media.client";

export default async function TransfersPage() {

    // 1. Fetch Stats
    const statsData = await db
        .select({
            status: transfers.status,
            count: sql<number>`count(*)`,
            totalAmount: sql<string>`sum(cast(${transfers.amount} as integer))`
        })
        .from(transfers)
        .groupBy(transfers.status);

    const totalCount = statsData.reduce((acc, curr) => acc + Number(curr.count), 0);
    const totalVolumeCents = statsData.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
    const totalVolume = totalVolumeCents / 100;

    // Average
    const avgAmount = totalCount > 0 ? totalVolume / totalCount : 0;

    // 2. Fetch recent transfers
    const recentTransfers = await db
        .select()
        .from(transfers)
        .orderBy(desc(transfers.createdAt))
        .limit(100);

    // 3. Fetch Users
    const userIds = new Set<string>();
    recentTransfers.forEach(tx => {
        userIds.add(tx.fromUserId);
        userIds.add(tx.toUserId);
    });

    const userMap = new Map<string, { id: string; email: string; name: string; avatar: string | undefined }>();

    if (userIds.size > 0) {
        const usersList = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                avatar: users.avatar,
            })
            .from(users)
            .where(inArray(users.id, Array.from(userIds)));

        usersList.forEach(u => {
            const avatarUrl = mediaClient.getAvatarUrl(u.id, u.avatar || false);

            userMap.set(u.id, {
                id: u.id,
                email: u.email,
                name: u.name || u.email, // Fallback
                avatar: avatarUrl || undefined
            });
        });
    }

    // 4. Map Data
    const formattedTransfers: TransferData[] = recentTransfers.map(tx => ({
        id: tx.id,
        amount: tx.amount, // Text (cents)
        status: tx.status,
        createdAt: tx.createdAt,
        fromUser: userMap.get(tx.fromUserId) || { id: tx.fromUserId, email: 'Unknown', name: 'Unknown' },
        toUser: userMap.get(tx.toUserId) || { id: tx.toUserId, email: 'Unknown', name: 'Unknown' },
        transaction: tx.transaction as any
    }));

    return (
        <div className="flex-1 space-y-6">
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Transfers</h2>
                    <p className="text-muted-foreground">
                        Monitor peer-to-peer transactions
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Volume
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total value transferred
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Transfers
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Completed transactions
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Avg. Transfer
                        </CardTitle>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${avgAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Average transaction size
                        </p>
                    </CardContent>
                </Card>
            </div>

            <TransfersTable transfers={formattedTransfers} />
        </div>
    );
}
