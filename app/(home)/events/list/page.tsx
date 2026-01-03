"use client";

import { useAuthStore } from "@/components/auth/use-auth-store";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { CreateEventModal } from "../components/create-event-modal";
import { UpcomingEvent } from "../components/upcoming-event";
import { MyEvents } from "../components/my-events";
import { useEvents, Event } from "../use-events";

export default function EventsListPage() {
    const { user } = useAuthStore();


    // Event & Birthday State
    const [isBirthdayEnabled, setIsBirthdayEnabled] = useState(false);
    const [birthdayTime, setBirthdayTime] = useState("");

    // UI State
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);

    // ...
    const { fetchEvents } = useEvents();

    useEffect(() => {
        if (user) {
            setIsBirthdayEnabled(user.user_metadata?.birthday_enabled || false);
            setBirthdayTime(user.user_metadata?.birthday_time || "");

            // Fetch events from DB
            fetchEvents();
        }
    }, [user, fetchEvents]);


    const handleEditEvent = (event: Event) => {
        setSelectedEvent(event);
        setIsEventModalOpen(true);
    };

    const handleCreateEvent = () => {
        setSelectedEvent(undefined);
        setIsEventModalOpen(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 animate-in fade-in-50 duration-500"
        >
            <div>
                <h3 className="text-lg font-medium">Events</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your upcoming events.
                </p>
            </div>

            <div className="flex flex-col gap-10">
                <div className="flex-1 space-y-6 flex flex-col gap-8">

                    <UpcomingEvent
                        birthdayTime={birthdayTime}
                        isBirthdayEnabled={isBirthdayEnabled}
                        onOpenModal={handleCreateEvent}
                    />

                    <CreateEventModal
                        isOpen={isEventModalOpen}
                        onClose={() => setIsEventModalOpen(false)}
                        eventToEdit={selectedEvent}
                    />

                    <MyEvents onEdit={handleEditEvent} />
                </div>
            </div>
        </motion.div>
    );
}
