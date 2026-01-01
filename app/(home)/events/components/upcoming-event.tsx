"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { EventTypes } from "@/lib/constants";
import { CalendarIcon, VideoIcon } from "lucide-react";
import { useEvents } from "../use-events";
import { cn, formatCompactNumber } from "@/lib/utils";

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

    const typeId = upcomingEvent?.type;
    const eventConfig = EventTypes.find(t => t.value === typeId);

    const ThemeIcon = eventConfig?.icon || CalendarIcon;
    const themeGradient = eventConfig?.color || "bg-linear-to-r from-pink-500 to-purple-500";

    const title = upcomingEvent?.title;
    const description = upcomingEvent?.description || "";
    const thumbnailUrl = upcomingEvent?.thumbnailUrl || "";

    const eventDate = upcomingEvent?.startTime ? new Date(upcomingEvent.startTime) : undefined;

    // Fallback/Default for now as EventType isn't explicitly in DB schema yet or fetched nicely


    const hasEvent = !!upcomingEvent;

    return (
        <div className="text-card-foreground shadow-xs space-y-4 overflow-hidden relative">
            <div className="absolute bottom-[42px] right-0 p-6 opacity-10">
                <ThemeIcon className={cn("w-12 h-12", !eventConfig && "text-pink-500")} />
            </div>
            <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                    <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
                        Upcoming Live Stream
                        {isBirthdayEnabled && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
                    </h3>
                    <p className="text-sm text-muted-foreground">Schedule your next celebration.</p>
                </div>
            </div>
            <Separator />
            <div className="bg-muted/30 rounded-lg p-4 relative overflow-hidden">
                {hasEvent ? (
                    <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                        <div className="w-full sm:w-48 aspect-video sm:aspect-auto sm:h-28 bg-muted rounded-md shrink-0 overflow-hidden relative border border-border/50">
                            {thumbnailUrl ? (
                                <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                                    <VideoIcon className="h-8 w-8 opacity-50" />
                                </div>
                            )}
                            {upcomingEvent?.isShort && (
                                <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white font-medium">9:16</div>
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-semibold text-lg leading-tight">{title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description || "No description provided."}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                                {eventDate && (
                                    <div className="flex items-center gap-1.5">
                                        <CalendarIcon className="h-4 w-4 text-pink-500" />
                                        <span>{format(eventDate, "MMM dd")}</span>
                                        {upcomingEvent?.startTime && (
                                            <span className="text-xs ml-1">
                                                {format(new Date(upcomingEvent.startTime), "h:mm a")}
                                            </span>
                                        )}
                                    </div>
                                )}
                                {birthdayTime && isBirthdayEnabled && (
                                    <div className="flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                        <span>{(() => {
                                            const [h, m] = birthdayTime.split(":");
                                            const hour = parseInt(h);
                                            const isPM = hour >= 12;
                                            const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
                                            return `${displayHour}:${m} ${isPM ? "PM" : "AM"}`;
                                        })()}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <span>{formatCompactNumber(upcomingEvent?.views || 0)} views</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span>{formatCompactNumber(upcomingEvent?.lreals || 0)}</span>
                                    <img src="/coin.svg" alt="LREAL" className="h-3 w-3" />
                                </div>
                            </div>
                            <div className="pt-2 flex justify-end">
                                <Button
                                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                                    type="button"
                                    onClick={() => {
                                        console.log("Start live stream:", upcomingEvent?.id);
                                    }}
                                >
                                    <VideoIcon className="mr-2 h-4 w-4" />
                                    Start Live Stream
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center space-y-3">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                            <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium">No upcoming event scheduled</p>
                            <p className="text-sm text-muted-foreground">Get ready for your big day by scheduling a stream!</p>
                        </div>
                        <Button
                            onClick={onOpenModal}
                            className="bg-linear-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                            type="button"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Schedule Now
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
