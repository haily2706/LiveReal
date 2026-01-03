"use client";

import { useEffect, useState } from "react";
import { fetchHederaTransaction } from "@/app/actions/wallet";
import { Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface HederaTransactionDetailsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    transactionId?: string;
}

export const HederaTransactionDetails = ({ open, onOpenChange, transactionId }: HederaTransactionDetailsProps) => {
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!transactionId || !open) return;

        let mounted = true;
        setLoading(true);
        setError(false);

        fetchHederaTransaction(transactionId)
            .then(data => {
                if (mounted) {
                    if (data) setDetails(data);
                    else setError(true);
                }
            })
            .catch(() => {
                if (mounted) setError(true);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => { mounted = false; };
    }, [transactionId, open]);

    const timestamp = details?.consensus_timestamp
        ? new Date(parseFloat(details.consensus_timestamp) * 1000).toLocaleString()
        : null;

    const sender = details?.token_transfers?.find((t: any) => t.amount < 0);
    const receiver = details?.token_transfers?.find((t: any) => t.amount > 0);
    const amount = sender ? Math.abs(sender.amount) : 0;
    const fee = details?.charged_tx_fee ? (parseInt(details.charged_tx_fee) / 100000000).toFixed(8) : "0";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Transaction Details</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-8 text-xs text-muted-foreground gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading details...</span>
                    </div>
                ) : error || !details ? (
                    <div className="text-center p-8 text-sm text-muted-foreground">
                        Transaction details unavailable
                    </div>
                ) : (
                    <div className="space-y-6 py-2">
                        <div className="text-center space-y-1">
                            <div className="text-3xl font-bold tracking-tighter text-primary">
                                {amount} <span className="text-lg font-normal text-muted-foreground">LiveReal</span>
                            </div>
                            {timestamp && (
                                <p className="text-xs text-muted-foreground">{timestamp}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">From</p>
                                <p className="font-mono text-sm bg-muted/40 p-1.5 rounded truncate w-full" title={sender?.account}>
                                    {sender?.account || "Unknown"}
                                </p>
                            </div>
                            <div className="text-muted-foreground/30 flex justify-center">
                                <ArrowRight className="h-4 w-4" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">To</p>
                                <p className="font-mono text-sm bg-muted/40 p-1.5 rounded truncate w-full" title={receiver?.account}>
                                    {receiver?.account || "Unknown"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-border/50">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Transaction ID</span>
                                <span className="font-mono">{transactionId}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground">Network Fee</span>
                                <span className="font-mono">{fee} HBAR</span>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
