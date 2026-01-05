"use client";

import { Separator } from "@/components/ui/separator";
import { EventCard } from "./event-card";
import { toast } from "sonner";
import { format, intervalToDuration, Interval } from "date-fns";
import { useEvents, Event } from "../use-events";
import { formatCompactNumber } from "@/lib/utils";
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

    const handleGoLive = (title: string) => {
        toast.success(`Going live with ${title}!`);
    };

    if (isLoading) {
        return (
            <div className="text-card-foreground rounded-xl shadow-xs space-y-4">
                <div className="space-y-2">
                    <h3 className="font-semibold leading-none tracking-tight">Events</h3>
                    <p className="text-sm text-muted-foreground">Manage your events.</p>
                </div>
                <div className="mt-6 text-center text-sm text-muted-foreground py-8">
                    Loading events...
                </div>
            </div>
        );
    }

    const eventList = ids.map(id => events[id]);

    return (
        <div className="text-card-foreground rounded-xl shadow-xs space-y-4">
            <div className="space-y-2">
                <h3 className="font-semibold leading-none tracking-tight">Events</h3>
                <p className="text-sm text-muted-foreground">Manage your events.</p>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {eventList.length === 0 ? (
                    <div className="col-span-full text-center text-sm text-muted-foreground py-8">
                        No events found. Create one to get started!
                    </div>
                ) : (
                    eventList.map((event) => (
                        <EventCard
                            key={event.id}
                            title={event.title}
                            date={event.startTime ? format(new Date(event.startTime), "MMM dd") : "TBD"}
                            duration={
                                event.startTime && event.endTime
                                    ? formatDuration({
                                        start: new Date(event.startTime),
                                        end: new Date(event.endTime),
                                    }) || undefined
                                    : undefined
                            }
                            thumbnailUrl={
                                event.thumbnailUrl ||
                                "https://images.unsplash.com/photo-1540575467063-17e6fc48dee5?q=80&w=1000&auto=format&fit=crop"
                            }
                            lreal={formatCompactNumber(event.lreals || 0)}
                            views={formatCompactNumber(event.views || 0)}
                            onEdit={() => handleEdit(event)}
                            onDelete={() => handleDeleteClick(event)}
                            onGoLive={() => handleGoLive(event.title)}
                        />
                    ))
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
