"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ThumbsUp,
    ThumbsDown,
    Share2,
    MoreHorizontal,
    MessageSquare,
    VideoIcon,
    Flag,
    Play,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Chat } from "./chat";

import { LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";
import { useAuthStore } from "@/components/auth/use-auth-store";

import { TokenContext } from "./token-context";
import { StreamPlayer } from "./stream-player";
import { StreamInviteAlert } from "./stream-invite-alert";

import { JoinStreamResponse } from "../../../../lib/livekit";
import { useTheme } from "next-themes";
import { useStreamContext } from "@/app/(home)/components/stream-manager";
import { mediaClient } from "@/lib/media.client";


interface LiveClientProps {
    eventId: string;
    role?: 'host' | 'viewer';
    initialData: {
        title: string;
        description: string | null;
        thumbnail: string | null;
        streamer: {
            id: string;
            name: string;
            avatar: string;
            username: string;
        };
    };
}

function ChatSkeleton({ className }: { className?: string }) {
    return (
        <div className={`flex flex-col bg-card rounded-xl border border-border w-full lg:w-[350px] shrink-0 relative overflow-hidden font-sans ${className}`}>
            <div className="flex items-center p-3 border-b border-border h-14">
                <div className="h-6 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex gap-2 opacity-50">
                        <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                        <div className="flex flex-col gap-2 w-full">
                            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-3 border-t border-border mt-auto">
                <div className="h-10 w-full bg-muted rounded-full animate-pulse" />
            </div>
        </div>
    );
}

export function LiveClient({ eventId, initialData, role = 'viewer' }: LiveClientProps) {
    const { user, getDisplayName } = useAuthStore();
    const {
        token, setToken,
        setAuthToken,
        setWsUrl,
        setStreamInfo,
        setVideoContainerRef,
        streamInfo,
        hasLeft
    } = useStreamContext()!;

    // Stable guest identity
    const guestIdentity = useState(`guest-${Math.random().toString(36).substring(7)}-viewer-${Math.random().toString(36).substring(7)}`)[0];

    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const createdStreamRef = useRef<string | null>(null);

    // UI States
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [likeTrigger, setLikeTrigger] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [entered, setEntered] = useState(false);
    const pathname = usePathname();


    useEffect(() => {
        setMounted(true);
        window.scrollTo(0, 0);
    }, []);

    // Fetch Token
    useEffect(() => {
        if (!eventId) return;

        // Prevent re-fetching if we are already connected to this stream
        if (streamInfo?.eventId === eventId && token) {
            return;
        }

        if (hasLeft) return;

        const isViewer = role === 'viewer';
        // If user is logged in, use their ID. If not, use stable guest ID.
        const identity = (user && user.id) ? user.id : guestIdentity;
        const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || (isViewer ? "Guest" : "Streamer");

        // Set initial stream info immediately so UI can update
        setStreamInfo({
            eventId,
            role,
            initialData
        });

        if (role === 'viewer') {
            // For viewers, use join_stream to get ws_url and auth_token
            const joinStream = async () => {
                try {
                    const displayName = getDisplayName() || name;
                    const res = await fetch("/api/stream/join_stream", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            room_name: eventId,
                            identity: identity,
                            name: displayName,
                        }),
                    });
                    const data = (await res.json()) as JoinStreamResponse;
                    if (data.auth_token) {
                        setAuthToken(data.auth_token);
                        setToken(data.connection_details.token);
                        setWsUrl(data.connection_details.ws_url);
                    }
                } catch (e) {
                    console.error("Failed to join stream", e);
                }
            };
            joinStream();
        } else {
            // For host: use create_stream implementation to get token and auth_token
            const createStream = async () => {
                if (!user) return;

                // Prevent duplicate calls
                if (createdStreamRef.current === eventId) return;
                createdStreamRef.current = eventId;

                try {
                    const displayName = getDisplayName() || name;
                    const res = await fetch("/api/stream/create_stream", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            room_name: eventId,
                            name: displayName,
                            metadata: {
                                creator_identity: user.id,
                                enable_chat: true,
                                allow_participation: true,
                            },
                        }),
                    });

                    if (!res.ok) {
                        console.error("Failed to create stream");
                        createdStreamRef.current = null;
                        return;
                    }

                    const data = await res.json();
                    setAuthToken(data.auth_token);
                    setToken(data.connection_details.token);
                    setWsUrl(data.connection_details.ws_url);
                } catch (error) {
                    console.error("Error creating stream:", error);
                    createdStreamRef.current = null;
                }
            };
            createStream();
        }
    }, [user, eventId, role, getDisplayName]);

    // Use initialData from server
    const live = {
        title: initialData.title,
        thumbnail: initialData.thumbnail || "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070",
        viewers: 0,
        channel: initialData.streamer,
        description: initialData.description
    };

    const handleLike = () => {
        setLikeTrigger(prev => prev + 1);
        // Dispatch reaction handled by ReactionBar inside StreamPlayer or separate
    };

    if (hasLeft) {
        return (
            <div className="flex items-center justify-center min-h-screen text-foreground bg-background">
                <div className="flex flex-col items-center gap-4">
                    <h2 className="text-2xl font-bold">Stream Ended</h2>
                    <p className="text-muted-foreground">The broadcast has finished.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen text-foreground bg-background relative">
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

            <div className="flex flex-col lg:flex-row w-full relative">
                {token && <StreamInviteAlert />}

                {/* Main Content */}
                <div className="flex-1 w-full relative z-10 pb-10">

                    <div className="max-w-[1700px] mx-auto p-4 lg:p-4 relative z-10">
                        {/* Video Player Container */}
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden group shadow-2xl ring-1 ring-border bg-black backdrop-blur-sm">
                            {/* LiveKit Video Room - Replaced by Portal Target */}
                            <div
                                className="absolute inset-0 z-0 h-full w-full"
                                ref={(node) => {
                                    // When this node mounts, we tell the manager to portal the video here.
                                    setVideoContainerRef(node);
                                    // Cleanup when unmounts (managed by useEffect if needed, but ref callback with null handles unmount)
                                    // React calls ref callback with null on unmount.
                                }}
                            />

                            {/* Connecting Overlay */}
                            {/* Connecting Overlay */}
                            {!token && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden bg-background/10 backdrop-blur-sm transition-all duration-500">
                                    {/* Blurred Background */}
                                    <div className="absolute inset-0 z-0">
                                        <Image
                                            src={live.thumbnail}
                                            alt={live.title}
                                            fill
                                            className="object-cover blur-md opacity-50"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-black/40" />
                                    </div>

                                    <div className="flex flex-col items-center gap-4 relative z-10 animate-in fade-in zoom-in duration-500">
                                        <div className="relative">
                                            {/* Glow Effect */}
                                            {/* <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" /> */}
                                            {/* Spinner Ring */}
                                            <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin z-10" />

                                            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white/10 shadow-2xl relative z-20">
                                                <AvatarImage src={mediaClient.getAvatarUrl(live.channel.id)} />
                                                <AvatarFallback className="text-4xl bg-zinc-900 text-white">
                                                    {live.channel.name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <p className="font-medium animate-pulse text-white/80">Stream is connecting...</p>
                                    </div>
                                </div>
                            )}

                            {/* Pre-Join Overlay */}

                            <div className="relative h-full w-full z-10 pointer-events-none">
                                {/* Floating Hearts Container - Replaced by ReactionBar logic via StreamPlayer (Confetti) or we can keep this for local effect */}
                                {/* For strict "WatchPage" parity, we might want to use ReactionBar instead. 
                                    I'll render ReactionBar below the video for interacting, and let StreamPlayer handle visual reactions (Confetti).
                                */}
                            </div>
                        </div>



                        {/* Info Section */}
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border">
                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-start">
                                        <div className="relative group cursor-pointer shrink-0">
                                            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-background relative">
                                                <AvatarImage src={mediaClient.getAvatarUrl(live.channel.id)} />
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
                                            <h1 className="font-bold text-lg flex items-center gap-2 text-foreground group cursor-pointer hover:text-primary transition-colors">
                                                {live.title}
                                            </h1>
                                            <div className="text-xs text-muted-foreground font-medium">
                                                {live.channel.name}
                                            </div>
                                        </div>
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
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                const url = window.location.href.split('?')[0];
                                                if (navigator.share) {
                                                    navigator.share({
                                                        title: live.title,
                                                        url: url,
                                                    }).catch(() => {
                                                        navigator.clipboard.writeText(url);
                                                        toast.success("Link copied to clipboard!");
                                                    });
                                                } else {
                                                    navigator.clipboard.writeText(url);
                                                    toast.success("Link copied to clipboard!");
                                                }
                                            }}
                                            className="rounded-full bg-card/80 backdrop-blur-xl border border-border hover:bg-muted text-foreground gap-2 px-4 h-9 text-sm font-medium shadow-lg hover:scale-105 transition-all"
                                        >
                                            <Share2 className="w-4 h-4" />
                                            Share
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-full bg-card/80 backdrop-blur-xl border border-border hover:bg-muted text-foreground h-9 w-9 shadow-lg hover:rotate-90 transition-all">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                                                    <Flag className="w-4 h-4 mr-2" />
                                                    Report
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Description Box */}
                                <div className="transition-all cursor-pointer group/desc">
                                    <div className="flex items-center gap-3 text-xs font-bold mb-2 text-foreground/90">
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


                {/* Chat Components */}
                {/* Desktop Chat Sidebar */}
                {token ? (
                    <Chat className="hidden lg:flex sticky top-[76px] h-[calc(100vh-92px)] mr-4 mt-4" />
                ) : (
                    <ChatSkeleton className="hidden lg:flex sticky top-[76px] h-[calc(100vh-92px)] mr-4 mt-4" />
                )}

                {/* Mobile Chat Button & Sheet */}
                <div className="lg:hidden">
                    <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
                        <SheetTrigger asChild>
                            <Button
                                className="fixed bottom-24 right-6 z-50 rounded-full h-10 w-10 shadow-2xl bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all hover:scale-110 active:scale-95 ring-offset-2 ring-offset-background ring-2 ring-indigo-500 animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500"
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
                            <SheetTitle className="sr-only">Live Chat</SheetTitle>
                            <div className="h-full w-full">
                                {token ? (
                                    <Chat className="h-full w-full border-0" onClose={() => setIsChatOpen(false)} />
                                ) : (
                                    <ChatSkeleton className="h-full w-full border-0" />
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </div >
    );
}

