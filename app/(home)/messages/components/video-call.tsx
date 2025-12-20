"use client";

import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { getToken } from "@/app/actions/livekit";
import { Button } from "@/components/ui/button";



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
    }, [room, username]);

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
            {/* Hide LiveKit internal chat toggle since we have our own side-chat */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .lk-chat-toggle { display: none !important; }
                
                [data-lk-theme="default"] {
                    --lk-bg: hsl(var(--background));
                    --lk-fg: hsl(var(--foreground));
                    --lk-control-bg: hsl(var(--secondary));
                    --lk-control-fg: hsl(var(--secondary-foreground));
                    --lk-control-hover-bg: hsl(var(--accent));
                    --lk-control-active-bg: hsl(var(--accent));
                    --lk-accent-bg: hsl(var(--primary));
                    --lk-accent-fg: hsl(var(--primary-foreground));
                    --lk-danger-fg: hsl(var(--destructive));
                    --lk-border-color: hsl(var(--border));
                }

                .lk-control-bar {
                    background-color: hsl(var(--background) / 0.8) !important;
                    backdrop-filter: blur(12px) !important;
                    border-top: 1px solid hsl(var(--border) / 0.4) !important;
                    padding: 0 1rem !important;
                    height: 80px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-radius: 0 !important;
                    margin-bottom: 0 !important;
                    box-sizing: border-box !important;
                }

                .lk-button {
                    background-color: transparent !important;
                    border: none !important;
                    padding: 1rem !important;
                }

                .lk-participant-metadata {
                    color: white !important;
                    padding: 4px 8px !important;
                    border-radius: 6px !important;
                }
                
                .lk-participant-name {
                    color: white !important;
                }

                .lk-connection-quality {
                    color: white !important;
                }

                @media (max-width: 640px) {
                    .lk-control-bar {
                        height: 64px !important;
                        padding: 0 0.5rem !important;
                    }
                    
                    .lk-button {
                        padding: 0.5rem !important;
                    }

                    .lk-button svg {
                        width: 20px !important;
                        height: 20px !important;
                    }
                }
            `}} />
            <LiveKitRoom
                video={true}
                audio={true}
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
            {/* Custom controls or overlay buttons can be added here if needed, 
                LiveKit's VideoConference handles most controls */}
            <Button
                onClick={onDisconnect}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 bg-background/50 hover:bg-destructive/90 hover:text-white rounded-full backdrop-blur-sm transition-all duration-300"
            >
                <X className="h-5 w-5" />
            </Button>
            {children}
        </div>
    );
}
