"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, ArrowUpRight, ArrowDownLeft, CreditCard, MoreHorizontal, Wallet as WalletIcon, CheckCircle2, XCircle, Clock, Landmark } from "lucide-react";
import { Coin } from "@/components/ui/coin";
import Image from "next/image";
import { CashInModal } from "./components/cash-in-modal";
import { CashOutModal } from "./components/cash-out-modal";
import { AddPaymentMethodModal } from "./components/add-payment-method-modal";
import { Badge } from "@/components/ui/badge";

type Transaction = {
    id: string;
    amount: string;
    currency: string;
    status: string;
    createdAt: string;
};

type PaymentMethod = {
    id: string;
    type: string;
    title: string;
    description: string;
    last4: string;
    isDefault?: boolean;
    expiry?: string;
};

export default function WalletPage() {
    const [balanceData, setBalanceData] = useState<{
        hbarBalance: string;
        tokenBalance: string;
        accountId: string;
    } | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
        {
            id: '1',
            type: 'bank',
            title: 'Chase Bank',
            description: 'Checking ending in 4242',
            last4: '4242',
            isDefault: true
        }
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [balanceRes, transactionsRes] = await Promise.all([
                    fetch('/api/wallet/balance'),
                    fetch('/api/wallet/transactions')
                ]);

                if (balanceRes.ok) {
                    const data = await balanceRes.json();
                    setBalanceData(data);
                }

                if (transactionsRes.ok) {
                    const data = await transactionsRes.json();
                    setTransactions(data);
                }
            } catch (error) {
                console.error("Failed to fetch wallet data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'succeeded':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-orange-500" />;
        }
    };

    const formatCurrency = (amount: string, currency: string) => {
        const value = parseInt(amount) / 100;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
        }).format(value);
    };

    const handleAddMethod = (newMethod: PaymentMethod) => {
        setPaymentMethods([...paymentMethods, newMethod]);
    };

    const usdBalance = balanceData ? parseInt(balanceData.tokenBalance) / 100 : 0;

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
            <div>
                <h3 className="text-lg font-medium">Wallet</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your balance, cash in/out, and payment methods.
                </p>
                {balanceData && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Hedera Account ID: <span className="font-mono">{balanceData.accountId}</span>
                    </p>
                )}
            </div>
            <Separator />

            {/* Balance Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="col-span-2 overflow-hidden relative border-none bg-linear-to-br from-primary/10 via-primary/5 to-background shadow-xl group">
                    {/* Background Coin */}
                    <div className="absolute -right-5 -bottom-5 opacity-[0.05] group-hover:opacity-15 transition-all duration-500 rotate-[15deg] group-hover:rotate-0 scale-100 group-hover:scale-110 pointer-events-none">
                        <Coin className="w-32 h-32 blur-[1px]" />
                    </div>

                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        {loading ? (
                            <div className="flex items-baseline gap-1 mb-1 animate-pulse">
                                <div className="h-8 w-24 bg-muted rounded"></div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <div className="text-3xl font-bold tracking-tighter">
                                        {balanceData ? parseInt(balanceData.tokenBalance).toLocaleString() : "0"}
                                    </div>
                                    <div className="text-sm font-normal text-muted-foreground">LREAL</div>
                                </div>
                                <div className="text-sm font-medium text-muted-foreground">
                                    ≈ {usdBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </div>
                            </>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                            <div className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                                +20.1%
                            </div>
                            <span className="text-xs text-muted-foreground">from last month</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <CashInModal>
                    <Card className="col-span-1 group flex flex-col justify-center items-center p-4 cursor-pointer bg-background hover:bg-muted/30 transition-all duration-300 border-dashed hover:border-solid hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10">
                        <div className="h-10 w-10 rounded-full bg-green-500/10 group-hover:scale-110 group-hover:bg-green-500 text-background group-hover:text-white flex items-center justify-center mb-2 transition-all duration-300 shadow-sm">
                            <ArrowDownLeft className="h-5 w-5" />
                        </div>
                        <div className="font-bold text-base group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Cash In</div>
                        <p className="text-[10px] text-muted-foreground text-center mt-1 group-hover:text-muted-foreground/80">Add funds to your wallet</p>
                    </Card>
                </CashInModal>

                <CashOutModal balance={usdBalance} paymentMethods={paymentMethods}>
                    <Card className="col-span-1 group flex flex-col justify-center items-center p-4 cursor-pointer bg-background hover:bg-muted/30 transition-all duration-300 border-dashed hover:border-solid hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10">
                        <div className="h-10 w-10 rounded-full bg-red-500/10 group-hover:scale-110 group-hover:bg-red-500 text-red-500 group-hover:text-white flex items-center justify-center mb-2 transition-all duration-300 shadow-sm">
                            <ArrowUpRight className="h-5 w-5" />
                        </div>
                        <div className="font-bold text-base group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Cash Out</div>
                        <p className="text-[10px] text-muted-foreground text-center mt-1 group-hover:text-muted-foreground/80">Withdraw funds to bank</p>
                    </Card>
                </CashOutModal>
            </div>

            {/* Cashout Methods */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-base font-semibold">Cashout Methods</h4>
                        <p className="text-sm text-muted-foreground">Manage accounts for withdrawals</p>
                    </div>
                    <AddPaymentMethodModal onAddMethod={handleAddMethod}>
                        <Button variant="outline" size="sm" className="h-9 gap-1 rounded-full px-4 hover:border-primary/50 hover:text-primary transition-colors">
                            <Plus className="h-4 w-4" />
                            Add New
                        </Button>
                    </AddPaymentMethodModal>
                </div>

                <Card className="overflow-hidden border-muted/60">
                    <CardContent className="p-0">
                        {paymentMethods.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No cashout methods added yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {paymentMethods.map((method) => (
                                    <div key={method.id} className="flex items-center p-4 gap-4 hover:bg-muted/10 transition-colors group">
                                        <div className="h-12 w-16 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-border/50 shadow-xs">
                                            {method.type === 'bank' ? (
                                                <Landmark className="h-6 w-6 text-zinc-500" />
                                            ) : (
                                                <CreditCard className="h-6 w-6 text-zinc-500" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium flex items-center gap-2">
                                                {method.title}
                                                {method.isDefault && (
                                                    <div className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground uppercase tracking-wider">Default</div>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {method.description}
                                                {method.expiry && ` • Expires ${method.expiry}`}
                                            </div>
                                        </div>
                                        {/* Future Feature: Edit/Delete/Make Default */}
                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold">Recent Activity</h4>
                    <Button variant="link" className="text-xs h-auto p-0">View All</Button>
                </div>
                <Card className="border-none shadow-none bg-transparent">
                    <CardContent className="p-0">
                        {transactions.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                No recent transactions
                            </div>
                        ) : (
                            <div className="divide-y divide-border/20">
                                {transactions.map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                                                {getStatusIcon(tx.status)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm leading-none">Cash In</div>
                                                <div className="text-[10px] text-muted-foreground mt-1">
                                                    {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-sm leading-none mb-1">
                                                +{formatCurrency(tx.amount, tx.currency)}
                                            </div>
                                            <Badge variant="outline" className={`h-5 px-1.5 text-[10px] capitalize ${tx.status === 'succeeded' ? 'border-green-500/20 text-green-600' :
                                                tx.status === 'failed' ? 'border-red-500/20 text-red-600' :
                                                    'border-orange-500/20 text-orange-600'
                                                }`}>
                                                {tx.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
