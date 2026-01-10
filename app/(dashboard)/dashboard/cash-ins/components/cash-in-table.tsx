"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mediaClient } from "@/lib/media.client";

export interface CashInData {
    id: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
    amount: number;
    currency: string;
    status: string;
    createdAt: Date | null;
}

interface CashInTableProps {
    cashIns: CashInData[];
}

export const CashInTable = ({ cashIns }: CashInTableProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCashIns = cashIns.filter((ci) =>
        ci.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ci.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card className="backdrop-blur-sm bg-card/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Cash Ins</CardTitle>
                        <CardDescription>
                            A list of recent cash-in transactions.
                        </CardDescription>
                    </div>
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search email or ID..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCashIns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No cash-ins found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCashIns.map((ci) => (
                                <TableRow key={ci.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={mediaClient.getAvatarUrl(ci.user.id)} />
                                                <AvatarFallback>{ci.user.name?.[0].toUpperCase() ?? "U"}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{ci.user.name}</span>
                                                <span className="text-xs text-muted-foreground">{ci.user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{formatCurrency(ci.amount / 100)}</span>
                                            <span className="text-xs text-muted-foreground">{ci.currency.toUpperCase()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "h-2 w-2 rounded-full",
                                                ci.status === "succeeded" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" :
                                                    ci.status === "pending" ? "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]" :
                                                        "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                                            )} />
                                            <span className="capitalize text-sm font-medium">
                                                {ci.status || "Unknown"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {ci.createdAt
                                            ? formatDistanceToNow(new Date(ci.createdAt), { addSuffix: true })
                                            : "N/A"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
