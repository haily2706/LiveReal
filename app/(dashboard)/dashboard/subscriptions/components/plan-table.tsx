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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { Plan } from "@/lib/types";
import { PLANS } from "@/lib/constants";

interface PlansTableProps {
    plans: Plan[];
}

export const PlansTable = ({ plans }: PlansTableProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="flex flex-col gap-8">
            <Card className="backdrop-blur-sm bg-card/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Plans</CardTitle>
                            <CardDescription>
                                A list of all subscription plans including their pricing and status.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                {isExpanded && (
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plans.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No plans found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    plans.map((plan) => (
                                        <TableRow key={plan.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {(() => {
                                                        const planDetails = PLANS.find(p => p.name === plan.name) || PLANS[0];
                                                        const Icon = planDetails.icon;
                                                        return (
                                                            <>
                                                                <Icon className={cn("h-4 w-4", `text-${planDetails.color}-500`)} />
                                                                <span className="font-medium">{plan.name}</span>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">

                                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                        {plan.description}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{formatCurrency(plan.price)}</span>
                                                    <span className="text-xs text-muted-foreground">/{plan.interval}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "h-2 w-2 rounded-full",
                                                        plan.active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-gray-500"
                                                    )} />
                                                    <span className="text-sm font-medium">
                                                        {plan.active ? "Active" : "Inactive"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                )}
            </Card>
        </div>
    );
};
