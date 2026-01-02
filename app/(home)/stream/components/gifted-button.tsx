"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gift as GiftIcon } from "lucide-react";
import { GiftGallery, Gift } from "@/app/(landing)/components/gift-gallery";
import { Coin } from "@/components/ui/coin";
import { cn } from "@/lib/utils";

interface GiftedButtonProps {
    onGiftSelect?: (gift: Gift) => void;
    className?: string;
}

export function GiftedButton({ onGiftSelect, className }: GiftedButtonProps) {
    const [open, setOpen] = useState(false);
    const [balanceData, setBalanceData] = useState<{
        tokenBalance: string;
    } | null>(null);

    useEffect(() => {
        if (open) {
            fetch('/api/wallet/balance')
                .then(res => res.json())
                .then(data => {
                    if (data && data.tokenBalance) {
                        setBalanceData(data);
                    }
                })
                .catch(err => console.error("Failed to fetch balance", err));
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="inline-flex">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    className={cn(
                                        "h-9 w-9 rounded-full bg-linear-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-110 transition-all shrink-0 border border-pink-400/20 cursor-pointer",
                                        className
                                    )}
                                >
                                    <GiftIcon className="h-4 w-4 fill-current" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                Send Gift
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl bg-background border-border text-foreground">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0">
                    <DialogTitle>Send a Gift</DialogTitle>
                    {balanceData && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mr-8">
                            <span className="text-xs text-muted-foreground mr-1">Balance:</span>
                            <span className="text-sm font-bold text-primary">
                                {parseInt(balanceData.tokenBalance).toLocaleString()}
                            </span>
                            <Coin className="w-4 h-4" />
                        </div>
                    )}
                </DialogHeader>
                <GiftGallery
                    variant="picker"
                    onSelect={(gift) => {
                        onGiftSelect?.(gift);
                        setOpen(false);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
