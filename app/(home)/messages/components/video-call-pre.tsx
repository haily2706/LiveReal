"use client";

import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface VideoCallProps {
    room: string;
    username: string;
    onDisconnect: () => void;
}

export function VideoCall({ room, username, onDisconnect }: VideoCallProps) {
    const [token, setToken] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const resp = await fetch(`/api/livekit?room=${room}&username=${username}`);
                const data = await resp.json();
                setToken(data.token);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [room, username]);

    // Use the server action instead of calculating it here if we can, 
    // but standard patterns often fetch from an API route. 
    // However, I created a server action `getToken`. 
    // Let's use the server action directly.

    return (
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            data-lk-theme="default"
            style={{ height: "100%", width: "100%" }}
            onDisconnected={onDisconnect}
        >
            <VideoConference />
        </LiveKitRoom>
    );
}
