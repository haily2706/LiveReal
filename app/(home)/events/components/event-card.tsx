"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarIcon, MoreVertical, Pencil, Trash2, Video, VideoIcon, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventCardProps {
    title: string;
    date: string;
    duration?: string;
    thumbnailUrl: string;
    lreal?: string;
    views?: string;
    onEdit?: () => void;
    onDelete?: () => void;
    onGoLive?: () => void;
}

export function EventCard({
    title,
    date,
    duration,
    thumbnailUrl,
    lreal,
    views,
    onEdit,
    onDelete,
    onGoLive
}: EventCardProps) {
    return (
        <div className="group relative flex border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors overflow-hidden">
            <div className="relative h-24 w-40 shrink-0 bg-muted">
                <img
                    src={thumbnailUrl}
                    alt={title}
                    className="h-full w-full object-cover"
                />
            </div>
            <div className="flex flex-col flex-1 px-3 py-2 min-w-0 justify-between gap-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="h-3 w-3" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onGoLive}>
                                <Video className="mr-2 h-4 w-4" />
                                Go Live
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onEdit}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {date}
                    </span>
                    {duration && (
                        <span className="flex items-center gap-1">
                            <VideoIcon className="h-3 w-3" />
                            {duration}
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        {views || "0"} views
                    </span>
                    <span className="flex items-center gap-1">
                        {lreal || "0"}
                        <img src="/coin.svg" alt="LREAL" className="h-3 w-3" />
                    </span>

                    <div className="pt-0 flex-1 text-right">
                        <Button variant="ghost" size="sm" className="px-0 text-xs text-pink-500 hover:text-pink-600 hover:bg-transparent font-medium p-0 justify-start">
                            Watch Replay &rarr;
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
