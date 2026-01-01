"use client";

import { Separator } from "@/components/ui/separator";
import { EventCard } from "./event-card";
import { toast } from "sonner";

export function MyEvents() {
    // Mock data for now, eventually this would come from a database or props
    const events = [
        {
            id: 1,
            title: "My 25th Birthday",
            date: "Oct 24",
            duration: "2h 15m",
            thumbnailUrl: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1740&auto=format&fit=crop",
            lreal: "12.4k",
            views: "2.5k"
        },
        {
            id: 2,
            title: "FanMeet 101",
            date: "Sep 12",
            duration: "1h 45m",
            thumbnailUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop",
            lreal: "8.3k",
            views: "1.8k"
        },
        {
            id: 3,
            title: "Karaoke Night Special",
            date: "Aug 05",
            duration: "3h 10m",
            thumbnailUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop",
            lreal: "15.2k",
            views: "3.2k"
        }
    ];

    const handleEdit = (title: string) => {
        toast.info(`Editing ${title}`);
    };

    const handleDelete = (title: string) => {
        toast.info(`Deleting ${title}`);
    };

    const handleGoLive = (title: string) => {
        toast.success(`Going live with ${title}!`);
    };

    return (
        <div className="text-card-foreground rounded-xl shadow-xs space-y-4">
            <div className="space-y-2">
                <h3 className="font-semibold leading-none tracking-tight">My Events</h3>
                <p className="text-sm text-muted-foreground">Manage your events.</p>
            </div>
            <Separator />
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {events.map((event) => (
                    <EventCard
                        key={event.id}
                        title={event.title}
                        date={event.date}
                        duration={event.duration}
                        thumbnailUrl={event.thumbnailUrl}
                        lreal={event.lreal}
                        views={event.views}
                        onEdit={() => handleEdit(event.title)}
                        onDelete={() => handleDelete(event.title)}
                        onGoLive={() => handleGoLive(event.title)}
                    />
                ))}
            </div>
        </div>
    );
}
