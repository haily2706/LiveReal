"use client";

import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, MoreHorizontal, Flag } from "lucide-react";
import { ReportModal } from "./report-modal";
import { cn } from "@/lib/utils";

interface StreamMenuProps {
    eventId: string;
    className?: string;
    vertical?: boolean;
}

export function StreamMenu({ eventId, className, vertical= true }: StreamMenuProps) {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-8 w-8 text-zinc-500 hover:text-black hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/10 rounded-full", className)}
                    >
                        {vertical ? <MoreVertical className="h-5 w-5" /> : <MoreHorizontal className="h-5 w-5" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => setIsReportModalOpen(true)}
                    >
                        <Flag className="w-4 h-4 mr-2" />
                        Report
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ReportModal
                open={isReportModalOpen}
                onOpenChange={setIsReportModalOpen}
                eventId={eventId}
            />
        </>
    );
}
