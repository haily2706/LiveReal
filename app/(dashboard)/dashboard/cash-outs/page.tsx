import { db } from "@/lib/db";
import { cashOuts, users } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { CashOutTable, CashOutData } from "./components/cash-out-table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DollarSign, Activity, CreditCard } from "lucide-react";

export default async function CashOutsPage() {
    // Fetch aggregated stats
    const statsData = await db
        .select({
            status: cashOuts.status,
            count: sql<number>`count(*)`,
            totalAmount: sql<string>`sum(cast(${cashOuts.amount} as integer))`,
        })
        .from(cashOuts)
        .groupBy(cashOuts.status);

    // Calculate totals
    const totalRequests = statsData.reduce((acc, curr) => acc + Number(curr.count), 0);

    // Status 3 is Transferred (Succeeded)
    const transferredTransactions = statsData.find(s => s.status === 3);
    const totalTransferredCents = transferredTransactions ? Number(transferredTransactions.totalAmount) : 0;
    const totalTransferred = totalTransferredCents / 100;

    // Status 0 (Open) and 1 (Approval) are Pending
    const pendingTransactions = statsData.filter(s => s.status === 0 || s.status === 1);
    const pendingCount = pendingTransactions.reduce((acc, curr) => acc + Number(curr.count), 0);
    const pendingAmountCents = pendingTransactions.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);
    const totalPending = pendingAmountCents / 100;

    // Fetch Cash Outs with Users
    const cashOutsData = await db
        .select({
            cashOut: cashOuts,
            user: {
                id: users.id,
                email: users.email,
                fullName: users.name,
            }
        })
        .from(cashOuts)
        .leftJoin(users, eq(cashOuts.userId, users.id))
        .orderBy(desc(cashOuts.createdAt))
        .limit(100);

    const formattedCashOuts: CashOutData[] = cashOutsData.map(({ cashOut, user }) => ({
        id: cashOut.id,
        user: {
            id: user?.id || "Unknown",
            email: user?.email || "Unknown",
            name: user?.fullName || user?.email || "Unknown"
        },
        amount: parseInt(cashOut.amount) / 100, // Show in dollars in the table props? Warning: Table expects number. Let's make sure table handles it. formatCurrency(val) usually expects dollars? In cash-in-table it did `formatCurrency(ci.amount / 100)`. Here I'm passing `parseInt(cashOut.amount) / 100` as `amount`. So in table it receives dollars. In `cash-in-table` implementation I saw `ci.amount / 100`. Here I am passing dollars. Let's adjust table to just take value and format it. 
        // Wait, in Step 21, `cash-in-table.tsx` lines 56 and 94:
        // Line 56: `amount: parseInt(cashIn.amount),` (so it's cents)
        // Line 94: `formatCurrency(ci.amount / 100)` (converts to dollars for display)
        // So for consistency, I should pass CENTS to the component, and let the component divide by 100.
        // Re-reading my `CashOutTable` code from previous step..
        // `<span className="font-medium">{formatCurrency(co.amount)}</span>`
        // I did NOT divide by 100 in the table component I just wrote.
        // So I should pass dollars here? OR update the table component to divide by 100.
        // Since `formatCurrency` usually handles the locale currency formatting, it takes the major unit (dollars).
        // If I pass cents to `formatCurrency(cents)`, it will show huge numbers.
        // So I must provide Dollars to `formatCurrency`.
        // In my `CashOutTable` I just wrote `formatCurrency(co.amount)`.
        // So here I must pass DOLLARS.
        // `amount: parseInt(cashOut.amount) / 100` -> This creates a float. 
        // Let's stick to this interaction for now.
        status: cashOut.status || 0,
        createdAt: cashOut.createdAt
    }));

    return (
        <div className="flex-1 space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Cash Outs</h2>
                    <p className="text-muted-foreground">
                        Manage withdrawal requests
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Transferred
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${totalTransferred.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total value of completed transfers
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Requests
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground">
                            ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })} awaiting approval
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Requests
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRequests}</div>
                        <p className="text-xs text-muted-foreground">
                            All time cash out requests
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Content */}
            <CashOutTable cashOuts={formattedCashOuts} />
        </div>
    );
}
