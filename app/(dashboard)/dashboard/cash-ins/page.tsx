import { db } from "@/lib/db";
import { cashIns, users } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { CashInTable, CashInData } from "./components/cash-in-table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DollarSign, Activity, CreditCard } from "lucide-react";

export default async function CashInsPage() {
    // Fetch aggregated stats
    const statsData = await db
        .select({
            status: cashIns.status,
            count: sql<number>`count(*)`,
            totalAmount: sql<string>`sum(cast(${cashIns.amount} as integer))`, // amount is text in db
        })
        .from(cashIns)
        .groupBy(cashIns.status);

    // Calculate totals
    const totalTransactions = statsData.reduce((acc, curr) => acc + Number(curr.count), 0);
    const succeededTransactions = statsData.find(s => s.status === 'succeeded');
    const totalVolumeCents = succeededTransactions ? Number(succeededTransactions.totalAmount) : 0;
    const totalVolume = totalVolumeCents / 100;
    const statsSucceededCount = succeededTransactions ? Number(succeededTransactions.count) : 0;
    const successRate = totalTransactions > 0
        ? ((statsSucceededCount / totalTransactions) * 100).toFixed(1)
        : "0.0";

    // Fetch Cash Ins with Users
    const cashInsData = await db
        .select({
            cashIn: cashIns,
            user: {
                id: users.id,
                email: users.email,
                fullName: users.name,
            }
        })
        .from(cashIns)
        .leftJoin(users, eq(cashIns.userId, users.id))
        .orderBy(desc(cashIns.createdAt))
        .limit(100);

    const formattedCashIns: CashInData[] = cashInsData.map(({ cashIn, user }) => ({
        id: cashIn.id,
        user: {
            id: user?.id || "Unknown",
            email: user?.email || "Unknown",
            name: user?.fullName || user?.email || "Unknown"
        },
        amount: parseInt(cashIn.amount),
        currency: cashIn.currency,
        status: cashIn.status || "unknown",
        createdAt: cashIn.createdAt
    }));

    return (
        <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Cash Ins</h2>
                    <p className="text-muted-foreground">
                        View and manage cash-in transactions
                    </p>
                </div>
            </div>

            {/* Stats */}
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
                            Total value of succeeded transactions
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Transactions
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTransactions}</div>
                        <p className="text-xs text-muted-foreground">
                            All time transactions count
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Success Rate
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{successRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            {statsSucceededCount} successful out of {totalTransactions}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Content */}
            <CashInTable cashIns={formattedCashIns} />
        </div>
    );
}
