"use strict";
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    ThumbsUp,
    ThumbsDown,
    Share2,
    MoreHorizontal,
    MessageSquare,
    VideoIcon,
} from "lucide-react";
import { ChatList } from "./chat-list";
import { BackgroundBlobs } from "@/components/ui/background-blobs";
import { LiveKitRoom, VideoConference, GridLayout, ParticipantTile, useTracks, RoomAudioRenderer, ControlBar } from "@livekit/components-react";
import "@livekit/components-styles";
import { useAuthStore } from "@/components/auth/use-auth-store";
import { getToken } from "@/app/actions/livekit";
import { Track } from "livekit-client";

function HostVideo() {
    const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], { onlySubscribed: false });
    return (
        <div className="relative h-full w-full">
            <GridLayout tracks={tracks}>
                <ParticipantTile />
            </GridLayout>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center z-50 p-2">
                <ControlBar
                    controls={{ microphone: true, camera: true, screenShare: true, chat: false, leave: true }}
                />
            </div>
        </div>
    );
}

function ViewerVideo() {
    const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);

    if (tracks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-background/80 backdrop-blur-sm p-8 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 animate-pulse">
                    <VideoIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Waiting for Stream</h3>
                <p className="text-muted-foreground max-w-md">
                    The streamer hasn't started broadcasting video yet, or you are connecting.
                </p>
            </div>
        );
    }

    return (
        <>
            <GridLayout tracks={tracks}>
                <ParticipantTile />
            </GridLayout>
            <RoomAudioRenderer />
        </>
    );
}

interface LiveClientProps {
    eventId: string;
    role?: 'host' | 'viewer';
    initialData: {
        title: string;
        description: string | null;
        thumbnail: string | null;
        streamer: {
            name: string;
            avatar: string;
            username: string;
        };
    };
}

export function LiveClient({ eventId, initialData, role = 'viewer' }: LiveClientProps) {
    const { user } = useAuthStore();
    const [token, setToken] = useState("");

    // UI States from original component
    const [hearts, setHearts] = useState<{ id: number; left: number; color: string }[]>([]);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [likeTrigger, setLikeTrigger] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Fetch Token
    useEffect(() => {
        if (!eventId) return;

        const isViewer = role === 'viewer';
        // If user is logged in, use their ID. If not, generate a random ID.
        // If it's a viewer (even if logged in), append a timestamp/random string to avoid kicking the host if testing with same account.
        const userId = user?.id || `guest-${Math.random().toString(36).substring(7)}`;
        const identity = isViewer ? `${userId}-viewer-${Math.random().toString(36).substring(7)}` : userId;
        const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || (isViewer ? "Guest Viewer" : "Streamer");

        getToken(eventId, identity, name, role)
            .then(setToken)
            .catch(console.error);
    }, [user, eventId, role]);

    // Use initialData from server
    const live = {
        title: initialData.title,
        thumbnail: initialData.thumbnail || "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070",
        viewers: 0, // In a real app, this should come from LiveKit metadata or a separate endpoint
        channel: initialData.streamer,
        description: initialData.description
    };

    const handleLike = () => {
        setLikeTrigger(prev => prev + 1);
        const newHearts = Array.from({ length: 5 }).map((_, i) => ({
            id: Date.now() + i,
            left: 85 + Math.random() * 10,
            color: ['#ff0000', '#ff4081', '#ff1744', '#d500f9'][Math.floor(Math.random() * 4)]
        }));
        setHearts(prev => [...prev, ...newHearts]);
    };

    // Hearts animation effect
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const newHeart = {
                    id: Date.now(),
                    left: Math.random() * 80 + 10, // 10% to 90%
                    color: ['#ff0000', '#ff4081', '#ff1744', '#d500f9'][Math.floor(Math.random() * 4)]
                };
                setHearts(prev => [...prev.slice(-15), newHeart]);
            }
        }, 800);
        return () => clearInterval(interval);
    }, []);

    // Clean up hearts
    useEffect(() => {
        const interval = setInterval(() => {
            setHearts(prev => prev.filter(h => Date.now() - h.id < 4000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!token) {
        return (
            <div className="flex items-center justify-center min-h-screen text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Connecting to Live Server...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-64px)] overflow-y-auto lg:overflow-hidden text-foreground relative">
            <style jsx global>{`
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(0.8); opacity: 0; }
                    10% { opacity: 1; transform: translateY(-20px) scale(1.2); }
                    100% { transform: translateY(-300px) scale(0); opacity: 0; }
                }
                .heart-float {
                    animation: floatUp 2s ease-out forwards;
                }
            `}</style>

            {/* Main Content */}
            <div className="flex-1 w-full overflow-y-visible lg:overflow-y-auto overflow-x-hidden relative scroll-smooth custom-scrollbar">
                <BackgroundBlobs />

                <div className="max-w-[1700px] mx-auto p-4 lg:p-6 relative z-10">
                    {/* Video Player Container */}
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden group shadow-2xl ring-1 ring-border bg-black backdrop-blur-sm">
                        {/* LiveKit Video Room */}
                        <div className="absolute inset-0 z-0">
                            <LiveKitRoom
                                token={token}
                                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                                connect={true}
                                data-lk-theme="default"
                                className="h-full w-full"
                            >
                                {role === 'host' ? (
                                    <HostVideo />
                                ) : (
                                    <ViewerVideo />
                                )}
                            </LiveKitRoom>
                        </div>

                        {/* Video Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-purple-500/20 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-1000 pointer-events-none" />

                        <div className="relative h-full w-full z-10 pointer-events-none">
                            {/* Floating Hearts Container */}
                            <div className="absolute bottom-20 right-10 w-32 h-80 pointer-events-none z-20">
                                {hearts.map(heart => (
                                    <div
                                        key={heart.id}
                                        className="absolute bottom-0 heart-float"
                                        style={{ left: `${heart.left}%`, color: heart.color }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                        </svg>
                                    </div>
                                ))}
                            </div>

                            {/* Overlay Controls - Only showing Top "LIVE" indicator for now */}
                            <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
                                {/* Top Controls */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 bg-red-600/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg shadow-red-900/20">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                            </span>
                                            LIVE
                                        </div>
                                        <div className="bg-black/60 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/90">
                                            {Number(live.viewers).toLocaleString()} watching
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-6">
                        <div className="space-y-4">
                            <h1 className="text-2xl font-bold leading-tight tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/50 bg-clip-text text-transparent drop-shadow-sm">
                                {live.title}
                            </h1>

                            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border">
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                                    <div className="relative group cursor-pointer shrink-0">
                                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-background relative">
                                            <AvatarImage src={live.channel.avatar} />
                                            <AvatarFallback>{live.channel.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-0.5 border-4 border-background z-10">
                                            <span className="sr-only">Live</span>
                                            <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg flex items-center gap-2 text-foreground group cursor-pointer hover:text-primary transition-colors">
                                            {live.channel.name}
                                            <span className="bg-blue-500/10 text-blue-400 p-0.5 rounded-full" title="Verified">
                                                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                </svg>
                                            </span>
                                        </h3>
                                        <div className="text-xs text-muted-foreground font-medium">
                                            Subscribers: Hidden
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setIsSubscribed(!isSubscribed)}
                                        className={`ml-auto sm:ml-4 rounded-full font-bold px-4 sm:px-6 h-8 sm:h-9 text-xs sm:text-sm transition-all duration-300 transform active:scale-95 ${isSubscribed
                                            ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                            : "bg-foreground text-background hover:bg-foreground/90 hover:scale-105 shadow-lg"
                                            }`}
                                    >
                                        {isSubscribed ? "Subscribed" : "Subscribe"}
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center bg-card/80 backdrop-blur-xl rounded-full border border-border overflow-hidden shadow-lg">
                                        <Button
                                            variant="ghost"
                                            onClick={handleLike}
                                            className="rounded-none px-4 text-foreground gap-2 hover:bg-muted hover:text-green-400 transition-colors border-r border-border h-9 relative overflow-hidden group/like"
                                        >
                                            <span className="absolute inset-0 bg-green-400/10 opacity-0 group-hover/like:opacity-100 transition-opacity" />
                                            <ThumbsUp className={`w-4 h-4 ${likeTrigger > 0 ? "fill-current text-green-600 dark:text-green-400 animate-[bounce_0.5s_ease-in-out]" : ""}`} />
                                            <span className="font-bold text-sm">{Math.floor(live.viewers * 0.8 + likeTrigger)}</span>
                                        </Button>
                                        <Button variant="ghost" className="rounded-none px-4 text-foreground hover:bg-muted hover:text-red-400 transition-colors h-9 relative group/dislike">
                                            <span className="absolute inset-0 bg-red-400/10 opacity-0 group-hover/dislike:opacity-100 transition-opacity" />
                                            <ThumbsDown className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <Button variant="ghost" className="rounded-full bg-card/80 backdrop-blur-xl border border-border hover:bg-muted text-foreground gap-2 px-4 h-9 text-sm font-medium shadow-lg hover:scale-105 transition-all">
                                        <Share2 className="w-4 h-4" />
                                        Share
                                    </Button>

                                    <Button variant="ghost" size="icon" className="rounded-full bg-card/80 backdrop-blur-xl border border-border hover:bg-muted text-foreground h-9 w-9 shadow-lg hover:rotate-90 transition-all">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Description Box */}
                            <div className="glass hover:bg-card/60 rounded-2xl p-5 transition-all cursor-pointer group/desc shadow-sm hover:shadow-md">
                                <div className="flex items-center gap-3 text-xs font-bold mb-2 text-foreground/90">
                                    <span>{Number(live.viewers).toLocaleString()} watching now</span>
                                    <span className="w-1 h-1 bg-foreground/30 rounded-full" />
                                    <span>Started streaming on {new Date().toLocaleDateString()}</span>
                                </div>
                                <div className="text-xs text-muted-foreground leading-relaxed font-medium">
                                    {live.description || (
                                        <>
                                            <p className="text-blue-600 dark:text-blue-400 font-bold mb-2 group-hover/desc:text-blue-500 dark:group-hover/desc:text-blue-300 transition-colors">#Live #Stream #Event</p>
                                            <p className="mb-1">Join the conversation!</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Chat Sidebar */}
            <ChatList className="hidden lg:flex" />

            {/* Mobile Chat Button & Sheet */}
            <div className="lg:hidden">
                <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
                    <SheetTrigger asChild>
                        <Button
                            className="fixed bottom-6 right-6 z-50 rounded-full h-10 w-10 shadow-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all hover:scale-110 active:scale-95 ring-offset-2 ring-offset-background ring-2 ring-indigo-500 animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500"
                            size="icon"
                        >
                            <MessageSquare className="w-7 h-7 fill-current drop-shadow-md animate-[bounce_2s_infinite]" />
                            <span className="absolute top-0 right-0 flex h-4 w-4 -mt-1 -mr-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-background"></span>
                            </span>
                            <span className="sr-only">Open Chat</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[85vh] p-0 border-t-0 rounded-t-3xl overflow-hidden bg-background">
                        <div className="h-full w-full">
                            <ChatList className="h-full w-full border-0" onClose={() => setIsChatOpen(false)} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
