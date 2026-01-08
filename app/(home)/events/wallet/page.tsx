"use client";

import { useEffect, useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, ArrowUpRight, ArrowDownLeft, CreditCard, MoreHorizontal, Wallet as WalletIcon, CheckCircle2, XCircle, Clock, Landmark, Trash2, Pencil, ArrowRightLeft } from "lucide-react";
import { Coin } from "@/components/ui/coin";
import Image from "next/image";
import { CashInModal } from "./components/cash-in-modal";
import { CashOutModal } from "./components/cash-out-modal";
import { AddPaymentMethodModal } from "./components/add-payment-method-modal";
import { Badge } from "@/components/ui/badge";
import { useWalletStore } from "./use-wallet-store";
import { TransferModal } from "./components/transfer-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuthStore } from "@/components/auth/use-auth-store";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

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

const getCashOutStatusLabel = (status: number) => {
    switch (status) {
        case 0: return 'Pending';
        case 1: return 'Approved';
        case 2: return 'Rejected';
        case 3: return 'Transferred';
        default: return 'Unknown';
    }
};

export default function WalletPage() {
    const { walletData: balanceData, fetchBalance, setWalletData } = useWalletStore();
    const { user, isLoading: isAuthLoading } = useAuthStore();
    const [cashInTransactions, setCashInTransactions] = useState<any[]>([]);
    const [cashOutTransactions, setCashOutTransactions] = useState<any[]>([]);
    const [transfers, setTransfers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    const fetchData = useCallback(async () => {
        if (!user) return;

        try {
            const [
                cashInsRes,
                cashOutsRes,
                paymentMethodRes,
                transfersRes
            ] = await Promise.all([
                fetch('/api/wallet/transactions/cash-in'),
                fetch('/api/wallet/transactions/cash-out'),
                fetch('/api/wallet/payment-method'),
                fetch('/api/wallet/transfers')
            ]);

            const [
                cashInsData,
                cashOutsData,
                paymentMethodData,
                transfersData
            ] = await Promise.all([
                cashInsRes.json(),
                cashOutsRes.json(),
                paymentMethodRes.json(),
                transfersRes.json()
            ]);

            // Always call fetchBalance from store
            await fetchBalance();

            setCashInTransactions(cashInsData.data || []);
            setCashOutTransactions(cashOutsData.data || []);
            setTransfers(transfersData.data || []);

            // This line correctly handles both cases: if paymentMethodData is null/undefined, it sets an empty array; otherwise, it sets an array with the method.
            setPaymentMethods(paymentMethodData.data ? [paymentMethodData.data] : []);
        } catch (error) {
            console.error("Failed to fetch wallet data", error);
        } finally {
            setLoading(false);
        }
    }, [user, fetchBalance]);

    useEffect(() => {
        if (isAuthLoading) return;

        if (user) {
            fetchData();
        } else {
            setLoading(false);
            setCashInTransactions([]);
            setCashOutTransactions([]);
            setTransfers([]);
            setPaymentMethods([]);
            setWalletData(null);
        }
    }, [user, isAuthLoading, fetchData, setWalletData]);

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
        setPaymentMethods([newMethod]);
    };

    const handleDeleteMethod = async () => {
        try {
            const response = await fetch('/api/wallet/payment-method', {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.success) {
                setPaymentMethods([]);
                toast.success("Payment method removed");
            } else {
                toast.error("Failed to remove payment method");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove payment method");
        }
    };

    const usdBalance = balanceData ? parseInt(balanceData.tokenBalance) / 100 : 0;

    return (
        <div
            className="space-y-8 animate-in fade-in-50 duration-500"
        >
            <div>
                <h3 className="text-lg font-semibold">Wallet</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your balance, cash in/out, and payment methods.
                </p>
            </div>

            {/* Balance Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card className="col-span-2 overflow-hidden relative border-none bg-linear-to-br from-primary/10 via-primary/5 to-background shadow-xl group">
                    {/* Background Coin */}
                    <div className="absolute -right-5 -bottom-5 opacity-[0.05] group-hover:opacity-15 transition-all duration-500 rotate-15 group-hover:rotate-0 scale-100 group-hover:scale-110 pointer-events-none">
                        <Coin className="w-32 h-32 blur-[1px]" />
                    </div>

                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        {loading ? (
                            <div className="animate-pulse">
                                <div className="h-9 w-24 bg-muted rounded mb-1"></div>
                                <div className="h-5 w-16 bg-muted rounded"></div>
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

                <CashOutModal balance={balanceData ? parseInt(balanceData.tokenBalance) : 0} paymentMethods={paymentMethods}>
                    <Card className="col-span-1 group flex flex-col justify-center items-center p-4 cursor-pointer bg-background hover:bg-muted/30 transition-all duration-300 border-dashed hover:border-solid hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10">
                        <div className="h-10 w-10 rounded-full bg-red-500/10 group-hover:scale-110 group-hover:bg-red-500 text-red-500 group-hover:text-white flex items-center justify-center mb-2 transition-all duration-300 shadow-sm">
                            <ArrowUpRight className="h-5 w-5" />
                        </div>
                        <div className="font-bold text-base group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Cash Out</div>
                        <p className="text-[10px] text-muted-foreground text-center mt-1 group-hover:text-muted-foreground/80">Withdraw funds to bank</p>
                    </Card>
                </CashOutModal>

                <TransferModal balance={balanceData ? parseInt(balanceData.tokenBalance) : 0} onTransferSuccess={fetchData}>
                    <Card
                        className="col-span-1 group flex flex-col justify-center items-center p-4 cursor-pointer bg-background hover:bg-muted/30 transition-all duration-300 border-dashed hover:border-solid hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
                    >
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 group-hover:scale-110 group-hover:bg-blue-500 text-blue-500 group-hover:text-white flex items-center justify-center mb-2 transition-all duration-300 shadow-sm">
                            <ArrowRightLeft className="h-5 w-5" />
                        </div>
                        <div className="font-bold text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Transfer</div>
                        <p className="text-[10px] text-muted-foreground text-center mt-1 group-hover:text-muted-foreground/80">Send funds to others</p>
                    </Card>
                </TransferModal>
            </div>

            {/* Cashout Methods */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-base font-semibold">Cashout Payment Method</h4>
                        <p className="text-sm text-muted-foreground">Manage bank account for withdrawals</p>
                    </div>

                </div>

                <Card className="overflow-hidden border-muted/60">
                    <CardContent className="p-0">
                        {paymentMethods.length === 0 ? (
                            <div className="p-8 flex flex-col items-center gap-4 text-center text-muted-foreground">
                                <p>No cashout methods added yet.</p>
                                <AddPaymentMethodModal onAddMethod={handleAddMethod}>
                                    {!loading && <Button variant="outline" size="sm" className="h-9 gap-1 rounded-full px-4 hover:border-primary/50 hover:text-primary transition-colors">
                                        <Plus className="h-4 w-4" />
                                        Add New
                                    </Button>
                                    }
                                </AddPaymentMethodModal>
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
                                        <AddPaymentMethodModal onAddMethod={handleAddMethod} existingMethod={method}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </AddPaymentMethodModal>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Payment Method?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to remove this payment method? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDeleteMethod} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
                </div>
                <Tabs defaultValue="cash-in" className="w-full">
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
                        <Card className="border-none shadow-none bg-transparent">
                            <CardContent className="p-0">
                                {cashInTransactions.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                        No recent cash in transactions
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/20">
                                        {cashInTransactions.map((tx) => (
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
                                                        +{parseInt(tx.amount).toLocaleString()} <span className="text-[9px] text-muted-foreground">LREAL</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'succeeded' ? 'bg-green-500' :
                                                            tx.status === 'failed' ? 'bg-red-500' :
                                                                'bg-orange-500'
                                                            }`} />
                                                        <span className="text-xs text-muted-foreground capitalize">
                                                            {tx.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="cash-out">
                        <Card className="border-none shadow-none bg-transparent">
                            <CardContent className="p-0">
                                {cashOutTransactions.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                        No recent cash out transactions
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/20">
                                        {cashOutTransactions.map((tx) => (
                                            <div key={tx.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                                                        {tx.status === 3 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                                                            tx.status === 2 ? <XCircle className="h-4 w-4 text-red-500" /> :
                                                                <Clock className="h-4 w-4 text-orange-500" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm leading-none">Cash Out</div>
                                                        <div className="text-[10px] text-muted-foreground mt-1">
                                                            {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-sm leading-none mb-1">
                                                        -{parseInt(tx.amount).toLocaleString()} <span className="text-[9px] text-muted-foreground">LREAL</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 3 ? 'bg-green-500' :
                                                            tx.status === 2 ? 'bg-red-500' :
                                                                'bg-orange-500'
                                                            }`} />
                                                        <span className="text-xs text-muted-foreground capitalize">
                                                            {getCashOutStatusLabel(tx.status)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="transfers">
                        <Card className="border-none shadow-none bg-transparent">
                            <CardContent className="p-0">
                                {transfers.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                        No recent transfers
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/20">
                                        {transfers.map((tx) => {
                                            const isSender = tx.fromUserId === balanceData?.userId;
                                            const otherUser = isSender ? tx.toUser : tx.fromUser;

                                            return (
                                                <div key={tx.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 border">
                                                            <AvatarImage src={otherUser?.avatar || ""} />
                                                            <AvatarFallback>{otherUser?.name?.[0] || otherUser?.email?.[0] || "?"}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="overflow-hidden">
                                                            <div className="font-medium text-sm leading-none truncate max-w-[150px] sm:max-w-xs">
                                                                {otherUser?.name || otherUser?.email || "Unknown User"}
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                                                <span>{isSender ? "Sent to" : "Received from"}</span>
                                                                <span className="hidden sm:inline">•</span>
                                                                <span className="truncate">{new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-sm leading-none mb-1">
                                                            {tx.fromUserId === balanceData?.userId ? "-" : "+"}{parseInt(tx.amount).toLocaleString()} <span className="text-[9px] text-muted-foreground">LREAL</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 justify-end">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                            <span className="text-xs text-muted-foreground capitalize">
                                                                {tx.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

        </div>
    );
}
