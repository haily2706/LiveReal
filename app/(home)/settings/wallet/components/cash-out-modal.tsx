"use client";

import { useState } from "react";
import { Loader2, ArrowUpRight, DollarSign, Wallet } from "lucide-react";
import { toast } from "sonner";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// Define locally to avoid dependency issues for now, can be imported if shared
interface PaymentMethod {
    id: string;
    type: string;
    title: string;
    description: string;
    last4: string;
}

interface CashOutModalProps {
    children: React.ReactNode;
    balance: number;
    paymentMethods: PaymentMethod[];
}

export function CashOutModal({ children, balance, paymentMethods }: CashOutModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const [selectedMethod, setSelectedMethod] = useState("");
    const [error, setError] = useState("");

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setAmount(val);

        // Basic validation
        const numVal = parseFloat(val);
        if (numVal > balance) {
            setError("Insufficient funds");
        } else if (numVal < 10) {
            setError("Minimum withdrawal is $10.00");
        } else {
            setError("");
        }
    };

    const handleCashOut = async () => {
        if (!amount || !selectedMethod) {
            setError("Please fill in all fields");
            return;
        }

        if (parseFloat(amount) > balance) {
            setError("Insufficient funds");
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API Request
            await new Promise((resolve) => setTimeout(resolve, 2000));

            toast.success(`Successfully initiated withdrawal of $${parseFloat(amount).toFixed(2)}`);
            setIsOpen(false);
            setAmount("");
            setSelectedMethod("");
        } catch (error) {
            console.error(error);
            toast.error("Failed to process withdrawal");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
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
                    <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between border">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
                            <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
                        </div>
                        <Wallet className="h-8 w-8 text-muted-foreground/30" />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Withdrawal Amount</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

                        <div className="space-y-2">
                            <Label>Destination</Label>
                            <Select onValueChange={setSelectedMethod} value={selectedMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.length > 0 ? (
                                        paymentMethods.map((method) => (
                                            <SelectItem key={method.id} value={method.id}>
                                                <span className="font-medium indent-1">{method.title}</span> - <span className="text-muted-foreground text-xs">{method.description}</span>
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-center text-muted-foreground">
                                            No payment methods added. Please add one first.
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleCashOut}
                            disabled={isLoading || !!error || !amount || !selectedMethod}
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Confirm Cash Out"}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
