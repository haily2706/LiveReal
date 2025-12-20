"use client";

import { useTransition } from "react";
import { format, isPast } from "date-fns";
import {
    MoreVertical,
    Play,
    Edit,
    Trash2,
    Eye,
    Globe,
    Lock,
    Signal,
    CalendarClock,
} from "lucide-react";
import { motion } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { deleteEvent, publishEvent } from "../actions";
import { cn } from "@/lib/utils";

interface EventTableRowProps {
    event: {
        id: string;
        title: string;
        description: string | null;
        startTime: Date | string;
        endTime: Date | string;
        isLive: boolean | null;
        status: string | null;
        thumbnailUrl: string | null;
    };
    onEdit?: (event: any) => void;
    mockStats?: {
        views: number;
        likes: number;
        comments: number;
        lreal: number;
        dislikes: number;
    };
    isVertical?: boolean;
    index?: number;
}

const MotionTableRow = motion(TableRow);

export function EventTableRow({
    event,
    onEdit,
    mockStats = { views: 0, likes: 0, comments: 0, lreal: 0, dislikes: 0 },
    isVertical = false,
    index = 0
}: EventTableRowProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    function onDelete() {
        startTransition(() => {
            deleteEvent(event.id)
                .then((data) => {
                    if (data.error) {
                        toast.error(data.error);
                    } else {
                        toast.success("Event deleted");
                        router.refresh();
                    }
                })
                .catch(() => toast.error("Something went wrong"));
        });
    }

    function onPublish() {
        startTransition(() => {
            publishEvent(event.id)
                .then((data) => {
                    if (data.error) {
                        toast.error(data.error);
                    } else {
                        toast.success("Event published");
                        router.refresh();
                    }
                })
                .catch(() => toast.error("Something went wrong"));
        });
    }

    const startDate = new Date(event.startTime);
    const endDate = new Date(event.endTime);

    // Status Logic
    let statusIcon = <Globe className="h-4 w-4 text-muted-foreground" />;
    let statusText = "Public";
    let statusSubtext = "Everyone can see this video";

    if (event.isLive) {
        statusText = "Live";
        statusIcon = <Signal className="h-4 w-4 text-red-500 animate-pulse" />;
    } else if (event.status === "draft") {
        statusText = "Draft";
        statusIcon = <Lock className="h-4 w-4 text-muted-foreground" />;
        statusSubtext = "Private to you";
    } else if (isPast(endDate)) {
        statusText = "Public"; // Ended but public
    } else if (event.status === "published") {
        statusText = "Published";
        statusIcon = <CalendarClock className="h-4 w-4 text-emerald-500" />;
    }

    // Deterministic Mock Stats based on ID
    const getHash = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    };

    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + "k";
        }
        return num.toLocaleString();
    };

    const seed = getHash(event.id);
    const views = mockStats.views || ((seed % 5000) + 1200);
    const likes = mockStats.likes || ((seed % 2000) + 300);
    const lreal = mockStats.lreal || ((seed % 1000) + 500);
    const comments = mockStats.comments || (seed % 50);
    const likePercentage = 95 + ((seed % 50) / 10);

    return (
        <MotionTableRow
            className="group hover:bg-muted/50 border-border dark:border-white/5 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
        >


            {/* Video / Short Content */}
            <TableCell className="w-[450px] py-2">
                <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className={cn(
                        "relative shrink-0 overflow-hidden rounded-md bg-muted border border-border dark:border-white/10 group-hover:border-border dark:group-hover:border-white/20 transition-colors",
                        "aspect-video w-[120px] h-[68px]"
                    )}>
                        {event.thumbnailUrl ? (
                            <Image
                                src={event.thumbnailUrl}
                                alt={event.title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-linear-to-br from-indigo-900 via-purple-900 to-black opacity-80" />
                        )}
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />

                        {/* Play Icon Overlay for Shorts */}
                        {isVertical && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-black/60 backdrop-blur-sm rounded-full p-1.5">
                                    <Play className="h-3 w-3 text-white fill-white" />
                                </div>
                            </div>
                        )}

                        {/* Duration Overlay */}
                        <div className={cn(
                            "absolute bg-black/80 backdrop-blur-sm px-1 py-0.5 rounded text-[8px] font-bold text-white tracking-wide flex items-center gap-0.5",
                            isVertical ? "bottom-1 right-1" : "bottom-1 right-1"
                        )}>
                            {isVertical ? (
                                <>
                                    <Signal className="h-2 w-2 text-red-500" />
                                    <span>2:18</span>
                                </>
                            ) : (
                                <span>3:00</span>
                            )}
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-col gap-0.5 py-0.5">
                        <Link
                            href={`/events/${event.id}`}
                            className="font-semibold text-sm text-foreground line-clamp-2 hover:text-brand-purple transition-colors mb-0"
                        >
                            {event.title}
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed max-w-[280px]">
                            {event.description || "Add a description to tell viewers what your video is about."}
                        </p>

                        {/* Hover Actions (Inline) */}
                        <div className="flex items-center gap-0 mt-auto pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {onEdit ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                    onClick={() => onEdit(event)}
                                >
                                    <Edit className="h-3 w-3" />
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                    asChild
                                >
                                    <Link href={`/events/${event.id}/edit`}>
                                        <Edit className="h-3 w-3" />
                                    </Link>
                                </Button>
                            )}


                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                                        <MoreVertical className="h-3.5 w-3.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48 bg-background border-border">
                                    {event.status !== "published" && (
                                        <DropdownMenuItem onClick={onPublish} disabled={isPending}>
                                            <Play className="mr-2 h-4 w-4" /> Publish
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={onDelete} disabled={isPending}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete forever
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </TableCell>

            {/* Visibility */}
            <TableCell className="align-top py-2">
                <div className="flex items-start gap-2">
                    <div className="mt-0.5">{statusIcon}</div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{statusText}</span>
                        {/* <span className="text-xs text-muted-foreground">{statusSubtext}</span> */}
                    </div>
                </div>
            </TableCell>

            {/* Date */}
            <TableCell className="align-top py-2">
                <div className="flex flex-col">
                    <span className="text-sm text-foreground mb-0">
                        {format(startDate, "MMM d, yyyy")}
                    </span>
                </div>
            </TableCell>

            {/* Views */}
            <TableCell className="align-top py-2">
                <span className="text-sm text-foreground">{formatNumber(views)}</span>
            </TableCell>

            {/* Comments */}
            <TableCell className="align-top py-2">
                <span className="text-sm text-foreground">{comments}</span>
            </TableCell>

            {/* LREAL */}
            <TableCell className="align-top py-2">
                <span className="text-sm font-semibold text-foreground">{formatNumber(lreal)}</span>
            </TableCell>

            {/* Likes (vs Dislikes) */}
            <TableCell className="align-top py-2 w-[200px]">
                <div className="flex flex-col gap-1 pt-0.5">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="text-foreground font-medium">{likePercentage.toFixed(1)}%</span>
                        <span>{formatNumber(likes)} like</span>
                    </div>
                    <div className="h-1 w-full bg-muted dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-muted-foreground/50 rounded-full" style={{ width: `${likePercentage}%` }} />
                    </div>
                </div>
            </TableCell>
        </MotionTableRow>
    );
}
