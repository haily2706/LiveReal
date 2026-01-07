"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { Coin } from "@/components/ui/coin";

import { useWalletStore } from "../use-wallet-store";

export function PremiumBalanceCard() {

    const { walletData, isLoading, fetchBalance } = useWalletStore();

    useEffect(() => {
        fetchBalance();
    }, []);

    if (isLoading) {
        return (
            <div className="mt-6 w-full h-24 bg-muted animate-pulse rounded-2xl" />
        );
    }

    return (
        <Link
            href="/events/wallet"
            className="block mt-6 p-4 rounded-xl bg-linear-to-b from-muted/50 to-transparent border border-border backdrop-blur-md relative overflow-hidden group cursor-pointer hover:border-purple-500/50 transition-all duration-300"
        >
            {/* Background Coin */}
            <div className="absolute -right-5 -bottom-5 opacity-[0.05] group-hover:opacity-15 transition-all duration-500 rotate-15 group-hover:rotate-0 scale-100 group-hover:scale-110 pointer-events-none">
                <Coin className="w-28 h-28 blur-[1px]" />
            </div>

            <div className="absolute inset-0 bg-linear-to-r from-transparent via-foreground/5 to-transparent -translate-x-full group-hover:animate-shimmer" />

            <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                    <div className="p-1 rounded-md bg-muted/50">
                        <Wallet className="w-3 h-3 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    Balance
                </div>
            </div>

            <div className="text-xl font-bold text-foreground tracking-tighter text-left flex items-center gap-1 relative z-10">
                {walletData?.tokenBalance ? parseInt(walletData.tokenBalance).toLocaleString() : "0"}
            </div>
        </Link>
    );
}
