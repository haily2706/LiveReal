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
import { toAvatarURL } from "@/lib/constants";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

import { HederaTransactionDetails } from "./hedera-transaction-details";

export interface TransferData {
    id: string;
    fromUser: {
        id: string;
        email?: string;
        name?: string;
        avatar?: string;
    };
    toUser: {
        id: string;
        email?: string;
        name?: string;
        avatar?: string;
    };
    amount: string;
    status: string;
    createdAt: Date | null;
    transaction?: {
        hederaTransactionId?: string;
    };
}

interface TransfersTableProps {
    transfers: TransferData[];
}

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "succeeded": return { bg: "bg-green-500", shadow: "shadow-[0_0_8px_rgba(34,197,94,0.4)]" };
        case "pending": return { bg: "bg-yellow-500", shadow: "shadow-[0_0_8px_rgba(234,179,8,0.4)]" };
        case "failed": return { bg: "bg-red-500", shadow: "shadow-[0_0_8px_rgba(239,68,68,0.4)]" };
        default: return { bg: "bg-gray-500", shadow: "shadow-[0_0_8px_rgba(107,114,128,0.4)]" };
    }
};

export const TransfersTable = ({ transfers }: TransfersTableProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTransfer, setSelectedTransfer] = useState<TransferData | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const filteredTransfers = transfers.filter((tx) =>
        (tx.fromUser.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (tx.fromUser.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (tx.toUser.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (tx.toUser.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewTransaction = (transfer: TransferData) => {
        setSelectedTransfer(transfer);
        setIsDialogOpen(true);
    };

    return (
        <>
            <Card className="backdrop-blur-sm bg-card/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Transfers</CardTitle>
                            <CardDescription>
                                A list of peer-to-peer transfers.
                            </CardDescription>
                        </div>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users or ID..."
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
                                <TableHead>From</TableHead>
                                <TableHead>To</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransfers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No transfers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTransfers.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={toAvatarURL(tx.fromUser.id)} />
                                                    <AvatarFallback>{tx.fromUser.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{tx.fromUser.name || "Unknown"}</span>
                                                    <span className="text-xs text-muted-foreground">{tx.fromUser.email || "No email"}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={toAvatarURL(tx.toUser.id)} />
                                                    <AvatarFallback>{tx.toUser.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{tx.toUser.name || "Unknown"}</span>
                                                    <span className="text-xs text-muted-foreground">{tx.toUser.email || "No email"}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{formatCurrency(parseInt(tx.amount) / 100)}</span>
                                                <span className="text-xs text-muted-foreground">USD</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    getStatusColor(tx.status).bg,
                                                    getStatusColor(tx.status).shadow
                                                )} />
                                                <span className="capitalize text-sm font-medium">
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {tx.createdAt
                                                ? formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })
                                                : "N/A"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => navigator.clipboard.writeText(tx.id)}
                                                    >
                                                        Copy Transaction ID
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleViewTransaction(tx)}>
                                                        View Transaction
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <HederaTransactionDetails
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                transactionId={selectedTransfer?.transaction?.hederaTransactionId}
            />
        </>
    );
};
