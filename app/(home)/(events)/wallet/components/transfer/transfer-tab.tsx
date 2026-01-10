"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TransferTabProps {
    transactions: any[];
    currentUserId?: string;
}

export function TransferTab({ transactions, currentUserId }: TransferTabProps) {
    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
                {transactions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        No recent transfers
                    </div>
                ) : (
                    <div className="divide-y divide-border/20">
                        {transactions.map((tx) => {
                            const isSender = tx.fromUserId === currentUserId;
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
                                            {tx.fromUserId === currentUserId ? "-" : "+"}{parseInt(tx.amount).toLocaleString()} <span className="text-[9px] text-muted-foreground">LREAL</span>
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
    );
}
