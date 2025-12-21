"use client";

import { useTransition } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
    Calendar,
    Trash2,
    Edit,
    Play,
    Clock,
    MoreVertical,
    Heart,
    Coins,
    Signal,
    CalendarClock,
    CheckCircle2,
    ThumbsUp,
    ThumbsDown,
    ChartNoAxesColumn
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteEvent, publishEvent } from "../actions";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { EventDurationBadge } from "./event-duration-badge";

import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

interface EventCardProps {
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
    isVertical?: boolean;
    index?: number;
    mockStats?: {
        views: number;
        likes: number;
        lreal: number;
    };
}

export function EventCard({
    event,
    onEdit,
    isVertical = false,
    index = 0,
    mockStats = { views: 0, likes: 0, lreal: 0 }
}: EventCardProps) {
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
    // const now = new Date();
    // const isEnded = isPast(endDate);

    // Determine detailed status
    let statusBadge;

    if (event.isLive) {
        statusBadge = (
            <Badge variant="destructive" className="animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)] font-bold tracking-widest border-0 flex items-center gap-1.5 px-3 py-1 bg-red-600/90 text-white">
                <Signal className="h-3 w-3" /> LIVE
            </Badge>
        );
    }

    // Interactive Stats (Mocked for now)
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

    return (
        <motion.div
            className={cn(
                "group relative flex flex-row md:flex-col gap-3 md:gap-3 w-full",
                isVertical ? "row-span-2" : "col-span-1"
            )}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
        >
            <Card className={cn(
                "relative overflow-hidden border-0 shadow-lg transition-all duration-500 hover:-translate-y-1 ring-1 ring-border dark:ring-white/5 bg-transparent shrink-0",
                isVertical ? "aspect-9/16" : "w-[35%] max-w-[130px] aspect-video md:w-full md:max-w-none"
            )}>
                {/* Main Background Image - Absolute Cover */}
                <div className="absolute inset-0 z-0">
                    {event.thumbnailUrl ? (
                        <Image
                            src={event.thumbnailUrl}
                            alt={event.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="h-full w-full bg-linear-to-br from-indigo-900 via-purple-900 to-black transition-all duration-500">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                        </div>
                    )}

                    {/* Dark Overlays for Text Readability */}
                    <div className={cn(
                        "absolute inset-0 transition-opacity duration-300",
                        isVertical
                            ? "bg-linear-to-t from-black/90 via-black/20 to-black/20 opacity-100"
                            : "bg-linear-to-t from-black/60 via-transparent to-black/20 opacity-60 group-hover:opacity-40"
                    )} />
                </div>

                {/* Date Badge - Top Right */}
                <div className={cn(
                    "absolute top-2 right-2 z-20",
                    !isVertical && "hidden md:block" // Show on desktop grid, hide on mobile row
                )}>
                    {/* Badge Removed */}
                </div>

                {/* Status Badge - Top Left */}
                <div className="absolute top-3 left-3 z-20">
                    {statusBadge}
                </div>

                {/* Menu Button - Top Right (Shifted Left if Badge is present) */}
                <div className={cn(
                    "absolute top-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block",
                    isVertical ? "right-3" : "right-3"
                )}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 rounded-full bg-background/80 dark:bg-black/40 backdrop-blur-md hover:bg-background dark:hover:bg-black/60 text-foreground dark:text-white border-0 shadow-lg ring-1 ring-border dark:ring-white/20 transition-all duration-300 hover:scale-105"
                            >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 bg-background/80 backdrop-blur-2xl border border-border dark:border-white/10 shadow-2xl p-1">
                            {event.status !== "published" && (
                                <DropdownMenuItem
                                    onClick={onPublish}
                                    disabled={isPending}
                                    className="cursor-pointer text-emerald-500 focus:text-emerald-500 focus:bg-emerald-500/10 p-2.5 rounded-sm font-medium"
                                >
                                    <Play className="mr-2 h-4 w-4" />
                                    Publish Event
                                </DropdownMenuItem>
                            )}
                            {onEdit ? (
                                <DropdownMenuItem onClick={() => onEdit(event)} className="cursor-pointer p-2.5 rounded-sm font-medium text-foreground dark:text-white">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Details
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem asChild>
                                    <Link href={`/events/${event.id}/edit`} className="cursor-pointer flex items-center p-2.5 rounded-sm font-medium text-foreground dark:text-white">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Details
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer p-2.5 rounded-sm font-medium"
                                onClick={onDelete}
                                disabled={isPending}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Event
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Vertical Layout Content - Overlay */}
                {isVertical && (
                    <div className="absolute inset-x-0 bottom-0 p-4 pt-12 z-10 flex flex-col gap-3">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1 max-w-[70%]">

                                <h3 className="font-bold text-base text-white line-clamp-2 leading-tight drop-shadow-md">
                                    {event.title}
                                </h3>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                    <CalendarClock className="h-3 w-3" />
                                    <span>{format(startDate, "MMM d • h:mm")}{format(startDate, "aaaaa").toLowerCase()}</span>
                                </div>
                            </div>

                            {/* Vertical Stats Pill */}
                            <div className="flex flex-col gap-2 items-end text-white">
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-[10px] shadow-lg">
                                    <ChartNoAxesColumn className="h-3 w-3 opacity-70" />
                                    <span>{formatNumber(views)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-xs shadow-lg">
                                    <ThumbsUp className="h-3.5 w-3.5 text-green-400" />
                                    <span>{formatNumber(likes)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!isVertical && (
                    <div className="absolute bottom-1 right-1 z-10">
                        <EventDurationBadge startTime={event.startTime} endTime={event.endTime} />
                    </div>
                )}

            </Card>

            {/* Horizontal Layout - Info */}
            {!isVertical && (
                <div className="flex flex-col gap-1.5 md:gap-2 px-0 md:px-1 flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-base md:text-lg line-clamp-2 md:line-clamp-1 leading-snug group-hover:text-primary transition-colors text-foreground tracking-tight">
                            {event.title}
                        </h3>

                        {/* Mobile Menu Button - Visible inline */}
                        <div className="md:hidden shrink-0 -mr-2 -mt-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {event.status !== "published" && (
                                        <DropdownMenuItem onClick={onPublish} disabled={isPending}>
                                            <Play className="mr-2 h-4 w-4" /> Publish
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => onEdit?.(event)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onDelete} disabled={isPending} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Unified Date & Description */}
                    <div className="mt-0.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                            <CalendarClock className="h-3.5 w-3.5 opacity-70" />
                            <span>{format(startDate, "MMM d, h:mm a")}</span>
                        </div>


                    </div>

                    {/* Minimal Stats Row */}
                    <div className="mt-auto flex items-center gap-3.5 pt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                            <ChartNoAxesColumn className="h-3.5 w-3.5 opacity-70" />
                            <span className="font-medium">{formatNumber(views)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-green-500 transition-colors">
                            <ThumbsUp className="h-3.5 w-3.5 opacity-70" />
                            <span className="font-medium">{formatNumber(likes)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-yellow-500 transition-colors">
                            <Image src="/coin.svg" alt="Coin" width={14} height={14} className="opacity-80 grayscale group-hover:grayscale-0 transition-all" />
                            <span className="font-medium">{formatNumber(lreal)}</span>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
