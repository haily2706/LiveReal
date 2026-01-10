"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
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

const getCashOutStatusLabel = (status: number) => {
    switch (status) {
        case 0: return 'Pending';
        case 1: return 'Approved';
        case 2: return 'Rejected';
        case 3: return 'Transferred';
        case 4: return 'Cancelled';
        default: return 'Unknown';
    }
};

interface CashOutTabProps {
    transactions: any[];
    onCancelRequest: (id: string, amount: string) => void;
}

export function CashOutTab({ transactions, onCancelRequest }: CashOutTabProps) {
    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
                {transactions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        No recent cash out transactions
                    </div>
                ) : (
                    <div className="divide-y divide-border/20">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                                        {tx.status === 3 ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                                            tx.status === 2 ? <XCircle className="h-4 w-4 text-red-500" /> :
                                                tx.status === 4 ? <XCircle className="h-4 w-4 text-zinc-500" /> :
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
                                                tx.status === 4 ? 'bg-zinc-500' :
                                                    'bg-orange-500'
                                            }`} />
                                        <span className="text-xs text-muted-foreground capitalize">
                                            {getCashOutStatusLabel(tx.status)}
                                        </span>
                                        {tx.status === 0 && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 ml-1 text-muted-foreground hover:text-red-500"
                                                        title="Cancel Request"
                                                    >
                                                        <XCircle className="h-3 w-3" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Cancel Cash Out Request?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to cancel this request for {parseInt(tx.amount).toLocaleString()} LREAL?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => onCancelRequest(tx.id, tx.amount)}
                                                            className="bg-red-600 hover:bg-red-700 text-white"
                                                        >
                                                            Yes, Cancel Request
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
