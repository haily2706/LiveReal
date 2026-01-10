"use client";

import { useState } from "react";
import { Coin } from "@/components/ui/coin";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CASH_IN_PLANS } from "@/app/(home)/(events)/wallet/constants";

interface CashInModalProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CashInModal({ children, open, onOpenChange }: CashInModalProps) {
    const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

    const onCheckout = async (planId: string) => {
        try {
            setProcessingPlanId(planId);
            const response = await axios.post("/api/payments/stripe/cash-in", {
                planId,
            });

            window.location.href = response.data.url;
        } catch (error) {
            console.error("Checkout failed", error);
            toast.error("Failed to start checkout");
        } finally {
            setProcessingPlanId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Coin size={28} />
                        Cash In LREAL
                    </DialogTitle>
                    <DialogDescription>
                        Purchase LREAL tokens to support creators and unlock premium features.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 md:grid-cols-3 pt-6">
                    {CASH_IN_PLANS.map((plan) => (
                        <Card
                            key={plan.id}
                            className={cn(
                                "relative transition-all hover:border-primary/50 cursor-pointer overflow-hidden flex flex-col",
                                plan.popular && "border-primary shadow-lg shadow-primary/10"
                            )}
                            onClick={() => onCheckout(plan.id)}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-bl-lg">
                                    Popular
                                </div>
                            )}
                            <div className={cn("absolute inset-0 opacity-[0.03] bg-linear-to-br", plan.gradient)} />
                            <CardHeader>
                                <CardTitle>
                                    <span className={cn("font-bold bg-linear-to-br bg-clip-text text-transparent", plan.gradient)}>
                                        {plan.name}
                                    </span>
                                </CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="grow">
                                <div className="text-2xl font-bold">
                                    {plan.lrealAmount.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">LREAL</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    disabled={!!processingPlanId}
                                    variant={plan.popular ? "default" : "outline"}
                                >
                                    {processingPlanId === plan.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        `Buy for $${plan.price}`
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
