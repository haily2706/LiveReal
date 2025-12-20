"use client";

import { useMemo } from "react";
import { differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface EventDurationBadgeProps {
    startTime: Date | string;
    endTime: Date | string;
    className?: string;
}

export function EventDurationBadge({ startTime, endTime, className }: EventDurationBadgeProps) {
    const duration = useMemo(() => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffInSeconds = Math.max(0, (end.getTime() - start.getTime()) / 1000);

        const hours = Math.floor(diffInSeconds / 3600);
        const minutes = Math.floor((diffInSeconds % 3600) / 60);
        const seconds = Math.floor(diffInSeconds % 60);

        const formattedMinutes = minutes.toString(); // Don't pad minutes if hours is 0
        const formattedSeconds = seconds.toString().padStart(2, "0");

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${formattedSeconds}`;
        }
        return `${formattedMinutes}:${formattedSeconds}`;
    }, [startTime, endTime]);

    return (
        <div className={cn(
            "px-1.5 py-0.5 rounded",
            "bg-background/80 dark:bg-black/80 backdrop-blur-sm",
            "text-[10px] font-bold text-foreground dark:text-white tracking-wide leading-none",
            "shadow-sm ring-1 ring-border dark:ring-white/10",
            className
        )}>
            {duration}
        </div>
    );
}
