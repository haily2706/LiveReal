"use client";

import { useEffect, useState, useCallback } from "react";
import { useWalletStore } from "./use-wallet-store";
import { useAuthStore } from "@/components/auth/use-auth-store";
import { WalletBalance } from "./components/wallet-balance";
import { WalletActions } from "./components/wallet-actions";
import { CashOutMethods } from "./components/cash-out/cash-out-methods";
import { WalletTransactionHistory } from "./components/wallet-history";

export default function WalletPage() {
    const { fetchBalance, setWalletData } = useWalletStore();
    const { user, isLoading: isAuthLoading } = useAuthStore();
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeTab, setActiveTab] = useState("cash-in");

    useEffect(() => {
        if (isAuthLoading) return;

        if (user) {
            fetchBalance();
        } else {
            setWalletData(null);
        }
    }, [user, isAuthLoading, fetchBalance, setWalletData]);

    const handleActionSuccess = useCallback((tab?: string) => {
        fetchBalance(true);
        setRefreshKey((prev: number) => prev + 1);
        if (tab) setActiveTab(tab);
    }, [fetchBalance]);

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
            <div>
                <h3 className="text-lg font-semibold">Wallet</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your balance, cash in/out, and payment methods.
                </p>
            </div>

            {/* Balance Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <WalletBalance onActionSuccess={handleActionSuccess} />
                <WalletActions onActionSuccess={handleActionSuccess} />
            </div>

            {/* Cashout Methods */}
            <CashOutMethods />

            {/* Transaction History */}
            <WalletTransactionHistory
                key={refreshKey}
                defaultTab={activeTab}
                onActionSuccess={() => handleActionSuccess()}
                onTabChange={setActiveTab}
            />
        </div>
    );
}
