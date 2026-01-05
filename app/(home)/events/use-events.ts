import { create } from 'zustand';
import { getUserEvents, deleteEvent as deleteEventAction, updateEvent as updateEventAction, createEvent as createEventAction } from '@/app/actions/event';
import { type InferSelectModel } from 'drizzle-orm';
import { events } from '@/lib/db/schema';

export type Event = InferSelectModel<typeof events>;

interface EventsState {
    events: Record<string, Event>;
    ids: string[];
    isLoading: boolean;
    error: string | null;
    fetchEvents: () => Promise<void>;
    getUpcomingEvent: () => Event | undefined;
    deleteEvent: (eventId: string) => Promise<{ success: boolean; error?: string }>;
    updateEvent: (eventId: string, data: Partial<Event>) => Promise<{ success: boolean; error?: string }>;
    createEvent: (data: {
        title: string;
        description?: string;
        eventType: number;
        startTime?: Date;
        thumbnailUrl?: string;
        isShort?: boolean;
        visibility?: string;
        invitedUsers?: { id: string; name: string }[];
    }) => Promise<{ success: boolean; data?: Event; error?: string }>;
}

export const useEvents = create<EventsState>((set, get) => ({
    events: {},
    ids: [],
    isLoading: false,
    error: null,
    fetchEvents: async () => {
        set({ isLoading: true, error: null });
        try {
            const result = await getUserEvents();
            if (result.success && result.data) {
                const eventsMap: Record<string, Event> = {};
                const ids: string[] = [];
                // data is sorted by createdAt desc from action, but for display we usually want specific sorts.
                // storing in order received (createdAt desc)
                result.data.forEach((event: any) => {
                    eventsMap[event.id] = event;
                    ids.push(event.id);
                });
                set({ events: eventsMap, ids });
            } else {
                set({ error: result.error || "Failed to fetch events" });
            }
        } catch (error) {
            set({ error: "An unexpected error occurred" });
        } finally {
            set({ isLoading: false });
        }
    },
    getUpcomingEvent: () => {
        const { events, ids } = get();
        const now = new Date();

        // Filter future events
        const futureEvents = ids
            .map(id => events[id])
            .filter(event => event.startTime && new Date(event.startTime) > now);

        // Sort by start time asc (closest first)
        futureEvents.sort((a, b) => {
            if (!a.startTime || !b.startTime) return 0;
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });

        return futureEvents[0];
    },
    deleteEvent: async (eventId: string) => {
        try {
            const result = await deleteEventAction(eventId);
            if (result.success) {
                set((state) => {
                    const newEvents = { ...state.events };
                    delete newEvents[eventId];
                    return {
                        events: newEvents,
                        ids: state.ids.filter(id => id !== eventId)
                    };
                });
            }
            return result;
        } catch (error) {
            return { success: false, error: "Failed to delete event" };
        }
    },
    updateEvent: async (eventId: string, data: Partial<Event>) => {
        try {
            // Transform Partial<Event> to the input format expected by the server action
            const updateInput = {
                title: data.title,
                description: data.description || undefined,
                type: data.type,
                startTime: data.startTime ? new Date(data.startTime) : undefined,
                thumbnailUrl: data.thumbnailUrl || undefined,
                isShort: data.isShort ?? undefined,
                visibility: data.visibility || undefined,
                invitedUsers: data.invitedUsers || undefined,
            };

            const result = await updateEventAction(eventId, updateInput);
            if (result.success && result.data) {
                set((state) => ({
                    events: {
                        ...state.events,
                        [eventId]: result.data as Event // Cast because result.data comes from DB, should match Event type
                    }
                }));
            }
            return { success: result.success, error: result.error };
        } catch (error) {
            return { success: false, error: "Failed to update event" };
        }
    },
    createEvent: async (data) => {
        try {
            const result = await createEventAction(data);
            if (result.success && result.data) {
                set((state) => ({
                    events: {
                        ...state.events,
                        [result.data.id]: result.data as Event
                    },
                    ids: [result.data.id, ...state.ids]
                }));
            }
            return result as { success: boolean; data?: Event; error?: string };
        } catch (error) {
            return { success: false, error: "Failed to create event" };
        }
    }
}));
