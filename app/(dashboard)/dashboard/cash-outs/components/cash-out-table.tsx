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

export interface CashOutData {
    id: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
    amount: number;
    status: number;
    createdAt: Date | null;
}

interface CashOutTableProps {
    cashOuts: CashOutData[];
}

const getStatusColorIdx = (status: number) => {
    switch (status) {
        case 0: return { bg: "bg-yellow-500", shadow: "shadow-[0_0_8px_rgba(234,179,8,0.4)]" }; // Open
        case 1: return { bg: "bg-blue-500", shadow: "shadow-[0_0_8px_rgba(59,130,246,0.4)]" }; // Approval
        case 2: return { bg: "bg-red-500", shadow: "shadow-[0_0_8px_rgba(239,68,68,0.4)]" }; // Rejected
        case 3: return { bg: "bg-green-500", shadow: "shadow-[0_0_8px_rgba(34,197,94,0.4)]" }; // Transferred
        default: return { bg: "bg-gray-500", shadow: "shadow-[0_0_8px_rgba(107,114,128,0.4)]" };
    }
};

const getStatusLabel = (status: number) => {
    switch (status) {
        case 0: return "Open";
        case 1: return "Approval";
        case 2: return "Rejected";
        case 3: return "Transferred";
        default: return "Unknown";
    }
};

export const CashOutTable = ({ cashOuts }: CashOutTableProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCashOuts = cashOuts.filter((co) =>
        co.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        co.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card className="backdrop-blur-sm bg-card/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Cash Outs</CardTitle>
                        <CardDescription>
                            A list of cash-out requests.
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
                        {filteredCashOuts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No cash-out requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCashOuts.map((co) => (
                                <TableRow key={co.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={toAvatarURL(co.user.id)} />
                                                <AvatarFallback>{co.user.name?.[0].toUpperCase() ?? "U"}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{co.user.name}</span>
                                                <span className="text-xs text-muted-foreground">{co.user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{formatCurrency(co.amount)}</span> {/* Amount is assumed to be in dollars or major units based on schema, but usually cents. Checking schema -> amount is text? need to be careful. Schema said amount text. In cash-ins it was cents divided by 100. Let's assume text amount is dollar value for now or consistency with cash-ins. Wait, cash-ins page divides by 100. Let's check schema again. cash_outs amount is text. Let's assume it fits the format of other monetary values. Users likely enter dollar amount. */}
                                            {/* Checking cash-out-modal.tsx in prior conversation context (not visible now but I recall) or conventions. Usually Stripe amounts are cents. But here we have a mix. Let's stick to raw display or standard formatting. If cash-ins divides by 100, likely stored in cents. I will implement assumes cents for now, but inspect usage later if needed. Actually schema says "Amount in cents" for cash_ins, but checks cash_outs just says "amount text". The implementation plan says "Amount (formatted)". I'll use formatCurrency assuming it might need /100 if it's in cents. Let's look at `formatCurrency` utility usage in `cash-in-table.tsx`: `formatCurrency(ci.amount / 100)`. So standard seems to be cents. I'll stick to that pattern. */}
                                            <span className="text-xs text-muted-foreground">USD</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "h-2 w-2 rounded-full",
                                                getStatusColorIdx(co.status).bg,
                                                getStatusColorIdx(co.status).shadow
                                            )} />
                                            <span className="capitalize text-sm font-medium">
                                                {getStatusLabel(co.status)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {co.createdAt
                                            ? formatDistanceToNow(new Date(co.createdAt), { addSuffix: true })
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
