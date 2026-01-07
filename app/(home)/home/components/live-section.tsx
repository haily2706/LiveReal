"use client";

import { LiveStream } from "@/lib/data";
import { StreamCard } from "./stream-card";

interface LiveSectionProps {
    lives: LiveStream[];
    title?: string;
}


import { useEffect, useState } from "react";

export function LiveSection({ lives, title = "Birthday Live" }: LiveSectionProps) {
    const [mergedLives, setMergedLives] = useState<LiveStream[]>(lives);

    useEffect(() => {
        const fetchLives = async () => {
            try {
                const response = await fetch('/api/events/live');
                const { success, data } = await response.json();

                if (success && data) {
                    const backendLives: LiveStream[] = data.map((event: any) => ({
                        id: event.id,
                        title: event.title,
                        thumbnail: event.thumbnailUrl || "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2670&auto=format&fit=crop",
                        channel: {
                            id: event.user.id,
                            name: event.user.name || "Unknown",
                            username: `@${event.user.name?.replace(/\s+/g, '').toLowerCase() || 'user'}`,
                            avatar: event.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.user.id}`,
                        },
                        viewers: event.views || 0,
                        isBirthday: false,
                        isVertical: event.isShort || false,
                        isBackend: true,
                    }));
                    setMergedLives([...backendLives, ...lives]);
                }
            } catch (error) {
                console.error("Failed to fetch live events:", error);
            }
        };
        fetchLives();
    }, [lives]);

    if (mergedLives.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-pink-500 to-purple-500 w-fit">{title}</h2>
                    <p className="text-sm text-muted-foreground">Catch the latest streaming events</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 grid-flow-dense auto-rows-auto">
                {mergedLives.slice(0, 5).map((live, index) => (
                    <StreamCard
                        key={live.id}
                        stream={live}
                        type="live"
                        index={index}
                        rank={index + 1}
                        isVertical={index >= 5}
                    />
                ))}
            </div>
        </div>
    );
}

