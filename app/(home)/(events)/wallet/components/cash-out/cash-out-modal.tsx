"use client";

import { useState, useEffect } from "react";
import { Loader2, ArrowUpRight, Wallet, CreditCard } from "lucide-react";
import { Coin } from "@/components/ui/coin";
import { toast } from "sonner";
import { useWalletStore } from "../../use-wallet-store";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


interface CashOutModalProps {
    children?: React.ReactNode;
    onSuccess?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CashOutModal({ children, onSuccess, open, onOpenChange }: CashOutModalProps) {
    const { walletData, paymentMethods, fetchPaymentMethods } = useWalletStore();
    const balance = walletData ? parseInt(walletData.tokenBalance) : 0;

    const [internalValidOpen, setInternalValidOpen] = useState(false);
    const isValidOpen = open !== undefined ? open : internalValidOpen;
    const setIsValidOpen = (value: boolean) => {
        setInternalValidOpen(value);
        onOpenChange?.(value);
    };
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (isValidOpen) {
            fetchPaymentMethods();
            // Reset state on open
            setAmount("");
            setError("");
        }
    }, [isValidOpen, fetchPaymentMethods]);

    // Identify the single linked account
    const linkedAccount = paymentMethods[0];

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setAmount(val);

        // Basic validation
        const numVal = parseFloat(val);
        if (numVal > balance) {
            setError("Insufficient funds");
        } else if (numVal < 10) {
            setError("Minimum withdrawal is 10 LREAL");
        } else {
            setError("");
        }
    };

    const handleCashOut = async () => {
        if (!amount || !linkedAccount) {
            setError("Please ensure you have a valid account linked and entered an amount");
            return;
        }

        const numVal = parseFloat(amount);
        if (numVal > balance) {
            setError("Insufficient funds");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch('/api/wallet/cash-out', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: numVal, paymentMethodId: linkedAccount.id }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(`Successfully initiated withdrawal of ${numVal.toLocaleString()} LREAL`);
                setIsValidOpen(false);
                setAmount("");
                onSuccess?.();
            } else {
                setError(result.error || "Failed to process withdrawal");
                toast.error(result.error || "Failed to process withdrawal");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to process withdrawal");
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isValidOpen} onOpenChange={setIsValidOpen}>
            {children && (
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <ArrowUpRight className="h-6 w-6 text-red-500" />
                        Cash Out
                    </DialogTitle>
                    <DialogDescription>
                        Withdraw funds to your connected account.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* CashOut Account Display (Moved to Top) */}
                    <div className="flex flex-col gap-4">
                        <Label>Cash Out To</Label>
                        {linkedAccount ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-background p-2 rounded-full border">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{linkedAccount.title}</p>
                                        <p className="text-xs text-muted-foreground">{linkedAccount.description}</p>
                                    </div>
                                </div>
                                {linkedAccount.last4 && (
                                    <span className="text-xs font-mono text-muted-foreground">•••• {linkedAccount.last4}</span>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground bg-muted/20">
                                <p className="text-sm">No payment method connected</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                            <p className="text-2xl font-bold">{balance.toLocaleString()}
                                <span className="text-xs text-muted-foreground pl-1">LREAL</span>
                            </p>
                        </div>
                        <Wallet className="h-8 w-8 text-muted-foreground/30" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-4">
                            <Label>Withdrawal Amount (LREAL)</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                    <Coin size={16} />
                                </div>
                                <Input
                                    className="pl-9"
                                    placeholder="0.00"
                                    type="number"
                                    step="0.01"
                                    min="10"
                                    value={amount}
                                    onChange={handleAmountChange}
                                />
                            </div>
                            {error && <p className="text-xs text-red-500">{error}</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsValidOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleCashOut}
                            disabled={isLoading || !!error || !amount || !linkedAccount}
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Confirm Cash Out
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
