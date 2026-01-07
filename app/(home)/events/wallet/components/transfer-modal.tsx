"use client";

import { useState } from "react";
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
import { Loader2, ArrowRightLeft, User, Search, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Coin } from "@/components/ui/coin";

export function TransferModal({ children, balance, onTransferSuccess }: { children: React.ReactNode, balance: number, onTransferSuccess?: () => void }) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [recipientEmail, setRecipientEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [recipient, setRecipient] = useState<{ id: string, name: string | null, email: string, avatar: string | null } | null>(null);

    const handleSearch = async () => {
        if (!recipientEmail) return;
        setSearching(true);
        try {
            const response = await fetch(`/api/wallet/user/search?email=${encodeURIComponent(recipientEmail)}`);
            const result = await response.json();

            if (result.success && result.data) {
                setRecipient(result.data);
            } else {
                toast.error(result.error || "User not found");
                setRecipient(null);
            }
        } catch (error) {
            toast.error("Failed to search user");
        } finally {
            setSearching(false);
        }
    };

    const handleTransfer = async () => {
        if (!amount || isNaN(parseFloat(amount))) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (!recipient) {
            toast.error("Please select a recipient");
            return;
        }

        const transferAmount = parseFloat(amount);
        if (transferAmount <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }

        if (transferAmount > balance) {
            toast.error("Insufficient balance");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/wallet/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amount,
                    recipientId: recipient.id
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Transfer successful");
                setOpen(false);
                setAmount("");
                setRecipientEmail("");
                setRecipient(null);
                onTransferSuccess?.();
            } else {
                toast.error(result.error || "Transfer failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <ArrowRightLeft className="h-6 w-6 text-blue-500" />
                        Transfer LREAL
                    </DialogTitle>
                    <DialogDescription>
                        Send LREAL coins to another user.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {!recipient ? (
                        <div className="grid gap-2">
                            <Label htmlFor="recipient">Recipient Email</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="recipient"
                                    value={recipientEmail}
                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                    placeholder="friend@example.com"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSearch();
                                        }
                                    }}
                                />
                                <Button type="button" onClick={handleSearch} disabled={searching || !recipientEmail}>
                                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                            <Avatar>
                                <AvatarImage src={recipient.avatar || ""} />
                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <div className="font-medium truncate">{recipient.name || recipient.email}</div>
                                <div className="text-xs text-muted-foreground truncate">{recipient.email}</div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setRecipient(null)}>
                                Change
                            </Button>
                        </div>
                    )}

                    <div className="flex items-center justify-between py-2">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                            <p className="text-2xl font-bold">{balance.toLocaleString()}
                                <span className="ml-1 text-xs text-muted-foreground">LREAL</span>
                            </p>
                        </div>
                        <Wallet className="h-8 w-8 text-muted-foreground/30" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount
                            <span className="ml-1 text-[9px] text-muted-foreground">(LREAL)</span>
                        </Label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <Coin size={16} />
                            </div>
                            <Input
                                className="pl-9"
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                min="0.01"
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleTransfer} disabled={loading || !recipient || !amount}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Transfer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
