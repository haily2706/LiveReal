"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EventDateBadgeProps {
    startTime: Date | string;
    className?: string;
}

export function EventDateBadge({ startTime, className }: EventDateBadgeProps) {
    const startDate = new Date(startTime);

    return (
        <div className={cn(
            "flex flex-col items-center justify-center w-9 rounded-md overflow-hidden",
            "bg-background/80 dark:bg-black/60 backdrop-blur-md",
            "border border-border dark:border-white/10",
            "shadow-lg",
            className
        )}>
            {/* Month */}
            <div className="w-full text-center py-0.5 bg-linear-to-b from-primary/20 to-transparent">
                <span className="text-[8px] font-bold uppercase text-primary/90 tracking-wider block leading-none">
                    {format(startDate, "MMM")}
                </span>
            </div>

            {/* Day */}
            <div className="flex-1 flex items-center justify-center py-0.5">
                <span className="text-base font-bold text-foreground dark:text-white tracking-tight">
                    {format(startDate, "d")}
                </span>
            </div>

            {/* Time */}
            <div className="w-full text-center py-0.5 pb-1 bg-linear-to-t from-primary/10 to-transparent">
                <span className="text-[7px] font-medium text-muted-foreground tracking-tight block leading-none">
                    {format(startDate, "h:mm")}{format(startDate, "aaaaa").toLowerCase()}
                </span>
            </div>
        </div>
    );
}
