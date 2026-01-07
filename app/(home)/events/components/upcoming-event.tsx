"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { EventTypes, toAvatarURL } from "@/lib/constants";
import { CalendarIcon, VideoIcon } from "lucide-react";
import { useEvents } from "../use-events";
import { cn, formatCompactNumber } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { startStream } from "@/app/(home)/events/actions/events";
import { toast } from "sonner";
import { ScheduleButton } from "./schedule-button";

interface UpcomingEventProps {
    birthdayTime: string;
    isBirthdayEnabled: boolean;
    onOpenModal: () => void;
}

export function UpcomingEvent({
    birthdayTime,
    isBirthdayEnabled,
    onOpenModal
}: UpcomingEventProps) {
    const upcomingEvent = useEvents(state => state.getUpcomingEvent());
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const typeId = upcomingEvent?.type;
    const eventConfig = EventTypes.find(t => t.value === typeId);

    const ThemeIcon = eventConfig?.icon || CalendarIcon;

    const isVideoCall = eventConfig?.value === 5;
    const invitedUsers = upcomingEvent?.invitedUsers || [];
    const singleInvitee = isVideoCall && invitedUsers.length === 1 ? invitedUsers[0] : null;

    let title = upcomingEvent?.title;
    if ((!title || title.trim() === "") && singleInvitee) {
        title = singleInvitee.name;
    }

    const description = upcomingEvent?.description || "";
    let thumbnailUrl = upcomingEvent?.thumbnailUrl;
    let isAvatar = false;

    if (!thumbnailUrl && isVideoCall) {
        if (singleInvitee) {
            const avatar = toAvatarURL(singleInvitee.id);
            if (avatar) {
                thumbnailUrl = avatar;
                isAvatar = true;
            }
        } else if (upcomingEvent?.userId) {
            const avatar = toAvatarURL(upcomingEvent.userId);
            if (avatar) {
                thumbnailUrl = avatar;
                isAvatar = true;
            }
        }
    }

    const isCompact = isAvatar && !!singleInvitee;
    const eventDate = upcomingEvent?.startTime ? new Date(upcomingEvent.startTime) : undefined;
    const hasEvent = !!upcomingEvent;

    const handleStartStream = async () => {
        if (!upcomingEvent?.id) return;
        setIsLoading(true);
        try {
            const result = await startStream(upcomingEvent.id);
            if (result.success) {
                toast.success("Stream started successfully!");
                router.push(`/stream/${upcomingEvent.id}?role=host`);
            } else {
                toast.error(result.error || "Failed to start stream");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="overflow-hidden relative group">
            {/* Decorative Background Icon */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none transition-opacity group-hover:opacity-[0.05]">
                {/* <ThemeIcon className={cn("w-40 h-40", !eventConfig && "text-pink-500")} /> */}
            </div>

            <div className={cn("relative z-10")}>
                {/* Header */}
                <div className={cn("flex items-center justify-between", isCompact ? "mb-4" : "mb-6")}>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg leading-none tracking-tight flex items-center gap-2">
                            {isVideoCall ? "Upcoming Call" : "Upcoming Event"}
                            {isBirthdayEnabled && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {hasEvent ? "Ready for your session?" : "Schedule your next celebration."}
                        </p>
                    </div>
                </div>

                {hasEvent ? (
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Thumbnail Section */}
                        {!isAvatar && (
                            <div className="w-full md:w-56 aspect-video md:aspect-auto rounded-lg shrink-0 overflow-hidden relative">
                                {thumbnailUrl ? (
                                    <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-muted-foreground/30">
                                        <VideoIcon className="h-10 w-10" />
                                    </div>
                                )}
                                {upcomingEvent?.isShort && (
                                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-medium uppercase tracking-wider">
                                        Short
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Content Section */}
                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="space-y-3">
                                <div className="flex gap-4 items-start">
                                    {isAvatar && thumbnailUrl && (
                                        <div className="relative shrink-0">
                                            <div className="absolute inset-0 bg-primary/20 rounded-full" />
                                            <img
                                                src={thumbnailUrl}
                                                alt={title}
                                                className="w-14 h-14 rounded-full object-cover border-2 border-background relative z-10 shadow-sm"
                                            />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-xl leading-tight truncate pr-2">{title}</h4>
                                        {isCompact && eventDate && (
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 mb-1">
                                                <CalendarIcon className="h-3 w-3" />
                                                <span>
                                                    {format(eventDate, "MMM dd")}
                                                    {upcomingEvent?.startTime && (
                                                        <span className="ml-1">
                                                            at {format(new Date(upcomingEvent.startTime), "h:mm a")}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>}
                                    </div>
                                </div>

                                {isVideoCall && invitedUsers.length > 1 && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2 overflow-hidden py-1">
                                            {invitedUsers.map((user) => {
                                                const avatar = toAvatarURL(user.id);
                                                return (
                                                    <div key={user.id} className="relative group/avatar cursor-help">
                                                        {avatar ? (
                                                            <img
                                                                src={avatar}
                                                                alt={user.name}
                                                                className="w-7 h-7 rounded-full border-2 border-background object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] uppercase font-bold text-muted-foreground">
                                                                {user.name.substring(0, 2)}
                                                            </div>
                                                        )}
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/avatar:block bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-200">
                                                            {user.name}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <span className="text-xs text-muted-foreground">Invited</span>
                                    </div>
                                )}
                            </div>

                            <div className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-4", isCompact ? "mt-2" : "mt-4")}>
                                <div className="space-y-1.5">
                                    {eventDate && !isCompact && (
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                                                <CalendarIcon className="h-4 w-4" />
                                            </div>
                                            <span>
                                                {format(eventDate, "MMM dd")}
                                                {upcomingEvent?.startTime && (
                                                    <span className="text-muted-foreground font-normal ml-1">
                                                        at {format(new Date(upcomingEvent.startTime), "h:mm a")}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground pl-1">
                                        {!isVideoCall && upcomingEvent?.views !== undefined && (
                                            <span>{formatCompactNumber(upcomingEvent.views)} views</span>
                                        )}
                                        {upcomingEvent?.lreals !== undefined && upcomingEvent.lreals! > 0 && (
                                            <div className="flex items-center gap-1">
                                                <span>{formatCompactNumber(upcomingEvent.lreals)}</span>
                                                <img src="/coin.svg" alt="LREAL" className="h-3 w-3 opacity-70" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
                                    size="default" // or lg
                                    onClick={handleStartStream}
                                    disabled={isLoading}
                                >
                                    <VideoIcon className="mr-2 h-4 w-4" />
                                    {isLoading ? "Starting..." : (isVideoCall ? "Start Video Call" : "Start Live Stream")}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className=" flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
                            <VideoIcon className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <div className="space-y-1 max-w-sm">
                            <h4 className="font-semibold text-foreground">No upcoming event</h4>
                            <p className="text-sm text-muted-foreground">
                                You don't have any event scheduled. Create one to connect with your audience!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

