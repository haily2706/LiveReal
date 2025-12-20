import { getEvents } from "./actions";
import { EventsView } from "./components/events-view";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Events | LiveReal",
    description: "Manage your upcoming live streams and broadcast events.",
};

export default async function EventsPage() {
    const events = await getEvents();

    return (
        <div className="flex flex-col min-h-screen relative">
            <EventsView initialEvents={events} />
        </div>
    );
}
