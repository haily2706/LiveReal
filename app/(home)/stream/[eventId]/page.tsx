import { db } from "@/lib/db";
import { events, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { LiveClient } from "@/app/(home)/stream/components/live-client";

interface PageProps {
    params: Promise<{ eventId: string }>;
    searchParams: Promise<{ role?: string }>;
}

export default async function LivePage({ params, searchParams }: PageProps) {
    const { eventId } = await params;
    const { role } = await searchParams;
    const userRole = role === 'host' ? 'host' : 'viewer';

    const event = await db
        .select({
            id: events.id,
            title: events.title,
            description: events.description,
            thumbnailUrl: events.thumbnailUrl,
            userId: events.userId,
            user: {
                name: users.name,
                avatar: users.avatar,
                email: users.email,
            }
        })
        .from(events)
        .leftJoin(users, eq(events.userId, users.id))
        .where(eq(events.id, eventId))
        .then(res => res[0]);

    if (!event) {
        notFound();
    }

    return (
        <LiveClient
            eventId={event.id}
            role={userRole}
            initialData={{
                title: event.title,
                description: event.description,
                thumbnail: event.thumbnailUrl,
                streamer: {
                    name: event.user?.name || "Streamer",
                    avatar: event.user?.avatar || "",
                    username: event.user?.email ? event.user.email.split('@')[0] : "streamer"
                }
            }}
        />
    );
}
