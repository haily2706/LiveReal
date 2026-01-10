"use client";

import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from "lucide-react";
import { CashInTab } from "./cash-in/cash-in-tab";
import { CashOutTab } from "./cash-out/cash-out-tab";
import { TransferTab } from "./transfer/transfer-tab";
import { useWalletStore } from "../use-wallet-store";
import { toast } from "sonner";
import { useAuthStore } from "@/components/auth/use-auth-store";

interface WalletTransactionHistoryProps {
    defaultTab?: string;
    onActionSuccess?: () => void;
    onTabChange?: (value: string) => void;
}

export function WalletTransactionHistory({ defaultTab = "cash-in", onActionSuccess, onTabChange }: WalletTransactionHistoryProps) {
    const { walletData } = useWalletStore();
    const { user } = useAuthStore();
    const [cashInTransactions, setCashInTransactions] = useState<any[]>([]);
    const [cashOutTransactions, setCashOutTransactions] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<any[]>([]);
    const [loading, setLoading] = useState(!!user);

    const fetchHistory = useCallback(async () => {
        if (!user) return;

        try {
            const [
                cashInsRes,
                cashOutsRes,
                transfersRes
            ] = await Promise.all([
                fetch('/api/wallet/cash-in'),
                fetch('/api/wallet/cash-out'),
                fetch('/api/wallet/transfers')
            ]);

            const [
                cashInsData,
                cashOutsData,
                transfersData
            ] = await Promise.all([
                cashInsRes.json(),
                cashOutsRes.json(),
                transfersRes.json()
            ]);

            setCashInTransactions(cashInsData.data || []);
            setCashOutTransactions(cashOutsData.data || []);
            setTransfers(transfersData.data || []);
        } catch (error) {
            console.error("Failed to fetch transaction history", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleCancelCashOut = async (id: string, amount: string) => {
        try {
            const response = await fetch('/api/wallet/cash-out/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Cancelled cash out request for ${parseInt(amount).toLocaleString()} LREAL`);
                fetchHistory();
                onActionSuccess?.();
            } else {
                toast.error(result.error || "Failed to cancel request");
            }
        } catch (error) {
            console.error("Error cancelling cash out:", error);
            toast.error("Failed to cancel request");
        }
    };

    return (
        <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
                <h4 className="text-base font-semibold">Recent Activity</h4>
            </div>
            <Tabs defaultValue={defaultTab} onValueChange={onTabChange} className="w-full animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                <TabsList className="w-auto flex bg-transparent p-0 gap-6 border-b border-border/40 rounded-none h-auto justify-start">
                    <TabsTrigger
                        value="cash-in"
                        className="bg-transparent shadow-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-1 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all gap-2"
                    >
                        <ArrowDownLeft className="h-4 w-4" />
                        Cash In
                    </TabsTrigger>
                    <TabsTrigger
                        value="cash-out"
                        className="bg-transparent shadow-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-1 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all gap-2"
                    >
                        <ArrowUpRight className="h-4 w-4" />
                        Cash Out
                    </TabsTrigger>
                    <TabsTrigger
                        value="transfers"
                        className="bg-transparent shadow-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-1 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all gap-2"
                    >
                        <ArrowRightLeft className="h-4 w-4" />
                        Transfers
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="cash-in">
                    {loading ? (
                        <div className="space-y-4 mt-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <div className="space-y-2 flex flex-col items-end">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <CashInTab transactions={cashInTransactions} />
                    )}
                </TabsContent>

                <TabsContent value="cash-out">
                    {loading ? (
                        <div className="space-y-4 mt-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <div className="space-y-2 flex flex-col items-end">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <CashOutTab transactions={cashOutTransactions} onCancelRequest={handleCancelCashOut} />
                    )}
                </TabsContent>

                <TabsContent value="transfers">
                    {loading ? (
                        <div className="space-y-4 mt-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <div className="space-y-2 flex flex-col items-end">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <TransferTab transactions={transfers} currentUserId={walletData?.userId} />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
