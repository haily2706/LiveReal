"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface CashInTabProps {
    transactions: any[];
}

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

export function CashInTab({ transactions }: CashInTabProps) {
    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
                {transactions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        No recent cash in transactions
                    </div>
                ) : (
                    <div className="divide-y divide-border/20">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between px-0 py-3 hover:bg-muted/10 transition-colors">
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
    );
}
