"use client";


import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { startStream } from "@/app/(home)/(events)/events/actions/events";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "./event-card";
import { toast } from "sonner";
import { format, intervalToDuration, Interval } from "date-fns";
import { useEvents, Event } from "../use-events";
import { formatCompactNumber } from "@/lib/utils";
import { EventTypes } from "@/lib/constants";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface MyEventsProps {
    onEdit?: (event: Event) => void;
}

export function MyEvents({ onEdit }: MyEventsProps) {
    const { ids, events, isLoading, deleteEvent: removeEvent } = useEvents();
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const router = useRouter();

    const handleEdit = (event: Event) => {
        if (onEdit) {
            onEdit(event);
        } else {
            toast.info(`Editing ${event.title}`);
        }
    };

    const handleDeleteClick = (event: Event) => {
        setEventToDelete(event);
    };

    const handleConfirmDelete = async () => {
        if (!eventToDelete) return;
        setIsDeleting(true);
        try {
            const { success, error } = await removeEvent(eventToDelete.id);
            if (success) {
                toast.success(`Deleted ${eventToDelete.title}`);
            } else {
                toast.error(error || "Failed to delete event");
            }
        } finally {
            setIsDeleting(false);
            setEventToDelete(null);
        }
    };

    const handleStartStream = async (event: Event) => {
        const actionText = "Stream";
        toast.promise(
            async () => {
                const result = await startStream(event.id);
                if (result.success) {
                    router.push(`/stream/${event.id}?role=host`);
                    return result;
                } else {
                    throw new Error(result.error || `Failed to start ${actionText.toLowerCase()}`);
                }
            },
            {
                loading: `Starting ${actionText.toLowerCase()}...`,
                success: `${actionText} started!`,
                error: (err) => err.message,
            }
        );
    };

    const eventList = ids.map(id => events[id]);

    return (
        <div className="text-card-foreground rounded-xl  space-y-4">
            <div className="space-y-2">
                <h3 className="font-semibold leading-none tracking-tight">Events</h3>
                <p className="text-sm text-muted-foreground">Manage your events.</p>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {isLoading ? (
                    [1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex border rounded-lg overflow-hidden">
                            <Skeleton className="h-24 w-40 shrink-0" />
                            <div className="flex flex-col flex-1 px-3 py-2 justify-between min-w-0">
                                <div className="flex justify-between gap-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-6 w-6 rounded-md" />
                                </div>
                                <div className="space-y-2 mt-auto">
                                    <Skeleton className="h-3 w-1/2" />
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-3 w-1/3" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : eventList.length === 0 ? (
                    <div className="col-span-full text-center text-sm text-muted-foreground py-8">
                        No events found. Create one to get started!
                    </div>
                ) : (
                    eventList.map((event) => {
                        const title = event.title;
                        let thumbnailUrl = event.thumbnailUrl;

                        if (!thumbnailUrl) {
                            thumbnailUrl = "https://images.unsplash.com/photo-1540575467063-17e6fc48dee5?q=80&w=1000&auto=format&fit=crop";
                        }

                        const eventConfig = EventTypes.find(t => t.value === event.type);
                        const ThemeIcon = eventConfig?.icon || CalendarIcon;


                        const dateStr = event.startTime
                            ? format(new Date(event.startTime), "MMM dd")
                            : "TBD";

                        return (
                            <EventCard
                                key={event.id}
                                title={title}
                                date={dateStr}
                                isVideoCall={false}
                                duration={
                                    event.startTime && event.endTime
                                        ? formatDuration({
                                            start: new Date(event.startTime),
                                            end: new Date(event.endTime),
                                        }) || undefined
                                        : undefined
                                }
                                thumbnailUrl={thumbnailUrl}
                                isShort={event.isShort || false}
                                icon={ThemeIcon}
                                lreal={formatCompactNumber(event.lreals || 0)}
                                views={formatCompactNumber(event.views || 0)}
                                onEdit={() => handleEdit(event)}
                                onDelete={() => handleDeleteClick(event)}
                                onGoLive={() => handleStartStream(event)}
                            />
                        );
                    })
                )}
            </div>
            <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the event "{eventToDelete?.title}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirmDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function formatDuration(interval: Interval) {
    const duration = intervalToDuration(interval);
    if (duration.hours) {
        return `${duration.hours}h${duration.minutes ? ` ${duration.minutes}m` : ""}`;
    }
    return `${duration.minutes || 0}m`;
}
