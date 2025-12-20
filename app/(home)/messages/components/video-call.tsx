"use client";

import { LiveKitRoom, VideoConference, PreJoin, type LocalUserChoices } from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { getToken } from "@/app/actions/livekit";
import { Button } from "@/components/ui/button";
import { CustomPreJoin } from "./pre-join";

export interface VideoCallProps {
    room: string;
    username: string; // This is actually the identity (ID)
    userName?: string; // This is the display name
    onDisconnect: () => void;
    className?: string;
    children?: React.ReactNode;
}

export function VideoCall({ room, username, userName, onDisconnect, className, children }: VideoCallProps) {
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [preJoinChoices, setPreJoinChoices] = useState<LocalUserChoices | undefined>(undefined);

    useEffect(() => {
        (async () => {
            try {
                // Pass the display name to getToken if available
                const generatedToken = await getToken(room, username, userName);
                setToken(generatedToken);
            } catch (e) {
                console.error("Failed to generate token", e);
                setError("Failed to connect to the call. Please check your connection and try again.");
            }
        })();
    }, [room, username, userName]);

    if (error) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-background/95 backdrop-blur-sm flex-col gap-4 p-6 text-center">
                <p className="text-destructive font-medium">{error}</p>
                <Button onClick={onDisconnect} variant="outline">Close</Button>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Connecting to secure call...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative flex flex-col h-full w-full bg-background overflow-hidden ${className || ''}`}>
            {/* Override styles for PreJoin and LiveKit components */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .lk-chat-toggle { display: none !important; }
                
                /* Make all control buttons transparent and borderless, except the disconnect (Leave) button */
                .lk-button:not(.lk-disconnect-button) {
                    background-color: transparent !important;
                    border-color: transparent !important;
                }
                
                .lk-button:not(.lk-disconnect-button):hover {
                    background-color: rgba(255, 255, 255, 0.1) !important;
                }
            `}} />            {!preJoinChoices ? (
                <CustomPreJoin
                    room={room}
                    username={username}
                    userName={userName || "Participant"}
                    onSubmit={setPreJoinChoices}
                    onCancel={onDisconnect}
                />
            ) : (
                <LiveKitRoom
                    video={preJoinChoices.videoEnabled ? { deviceId: preJoinChoices.videoDeviceId } : false}
                    audio={preJoinChoices.audioEnabled ? { deviceId: preJoinChoices.audioDeviceId } : false}
                    token={token}
                    serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                    data-lk-theme="default"
                    style={{ height: '100%', width: '100%' }}
                    onDisconnected={onDisconnect}
                    onError={(err) => {
                        console.error("LiveKit error:", err);
                        setError("An error occurred with the video connection.");
                    }}
                >
                    <VideoConference />
                </LiveKitRoom>
            )}

            {/* Close / Disconnect Button */}
            <Button
                onClick={onDisconnect}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 bg-background/50 hover:bg-destructive/90 hover:text-white rounded-2xl backdrop-blur-sm transition-all duration-300 shadow-lg"
            >
                <X className="h-5 w-5" />
            </Button>

            {/* Children typically contain overlays */}
            {children}
        </div>
    );
}
