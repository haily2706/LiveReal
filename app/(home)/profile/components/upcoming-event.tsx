"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { EventTypes } from "@/lib/constants";
import { CalendarIcon, VideoIcon } from "lucide-react";

interface UpcomingEventProps {
    title: string;
    description: string;
    thumbnailUrl: string;
    isShortStream: boolean;
    liveStreamDate: Date | undefined;
    birthdayTime: string;
    isBirthdayEnabled: boolean;
    eventType: string;
    onOpenModal: () => void;
}

export function UpcomingEvent({
    title,
    description,
    thumbnailUrl,
    isShortStream,
    liveStreamDate,
    birthdayTime,
    isBirthdayEnabled,
    eventType,
    onOpenModal
}: UpcomingEventProps) {
    return (
        <div className="text-card-foreground shadow-xs space-y-4 overflow-hidden relative">
            <div className="absolute top-[-24px] right-0 p-6 opacity-10">
                <CalendarIcon className="w-12 h-12 text-pink-500" />
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
                {title ? (
                    <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                        <div className="w-full sm:w-48 aspect-video sm:aspect-auto sm:h-28 bg-muted rounded-md shrink-0 overflow-hidden relative border border-border/50">
                            {thumbnailUrl ? (
                                <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                                    <VideoIcon className="h-8 w-8 opacity-50" />
                                </div>
                            )}
                            {isShortStream && (
                                <div className="absolute top-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white font-medium">9:16</div>
                            )}
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-semibold text-lg leading-tight">{title}</h4>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description || "No description provided."}</p>
                                </div>
                                <span className="shrink-0 px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                                    {EventTypes.find(e => e.value.toString() === eventType)?.name || "Event"}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
                                {liveStreamDate && (
                                    <div className="flex items-center gap-1.5">
                                        <CalendarIcon className="h-4 w-4 text-pink-500" />
                                        <span>{format(liveStreamDate, "PPP")}</span>
                                    </div>
                                )}
                                {birthdayTime && (
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
                        <Button onClick={onOpenModal} variant="secondary" size="sm" type="button">
                            Schedule Now
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
