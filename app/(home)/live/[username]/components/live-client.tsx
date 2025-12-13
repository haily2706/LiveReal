"use client";

import { use, useEffect, useState } from "react";
import { birthdayLives, LiveStream } from "@/lib/data";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    ThumbsUp,
    ThumbsDown,
    Share2,
    MoreHorizontal,
    Maximize2,
    Play,
    Volume2,
    Settings,
    MessageSquare,
    Scissors,
    Save
} from "lucide-react";
import { ChatList } from "./chat-list";

interface LiveClientProps {
    username: string;
}

export function LiveClient({ username }: LiveClientProps) {
    const [live, setLive] = useState<LiveStream | null>(null);
    const [hearts, setHearts] = useState<{ id: number; left: number; color: string }[]>([]);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [likeTrigger, setLikeTrigger] = useState(0);

    const handleLike = () => {
        setLikeTrigger(prev => prev + 1);
        // Add a burst of hearts
        const newHearts = Array.from({ length: 5 }).map((_, i) => ({
            id: Date.now() + i,
            left: 85 + Math.random() * 10,
            color: ['#ff0000', '#ff4081', '#ff1744', '#d500f9'][Math.floor(Math.random() * 4)]
        }));
        setHearts(prev => [...prev, ...newHearts]);
    };

    useEffect(() => {
        // Decode username as it might be URL encoded
        const decodedUsername = decodeURIComponent(username);

        // Find the live stream for this user
        // We search in birthdayLives for now based on the previous context
        // In a real app, you'd fetch this from an API
        const foundLive = birthdayLives.find(l =>
            l.channel.username === `@${decodedUsername}` ||
            l.channel.username === decodedUsername
        );

        if (foundLive) {
            setLive(foundLive);
        }
    }, [username]);

    useEffect(() => {
        // Simulate incoming hearts
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

    if (!live) {
        return (
            <div className="flex items-center justify-center min-h-screen text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Connecting to server...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-64px)] overflow-y-auto lg:overflow-hidden bg-background text-foreground relative">
            <style jsx global>{`
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(0.8); opacity: 0; }
                    10% { opacity: 1; transform: translateY(-20px) scale(1.2); }
                    100% { transform: translateY(-300px) scale(0); opacity: 0; }
                }
                .heart-float {
                    animation: floatUp 2s ease-out forwards;
                }
                @keyframes equalizer {
                    0%, 100% { height: 4px; }
                    50% { height: 16px; }
                }
                .bar {
                    width: 3px;
                    background: currentColor;
                    border-radius: 999px;
                    animation: equalizer 1s ease-in-out infinite;
                }
                .bar:nth-child(1) { animation-duration: 0.8s; animation-delay: 0.1s; }
                .bar:nth-child(2) { animation-duration: 1.1s; animation-delay: 0.2s; }
                .bar:nth-child(3) { animation-duration: 0.9s; animation-delay: 0.3s; }
                .bar:nth-child(4) { animation-duration: 1.2s; animation-delay: 0.4s; }
                .bar:nth-child(4) { animation-duration: 1.2s; animation-delay: 0.4s; }
            `}</style>

            {/* Main Content */}
            <div className="flex-1 w-full overflow-y-visible lg:overflow-y-auto overflow-x-hidden relative scroll-smooth custom-scrollbar">
                {/* Dynamic Background Mesh */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/30 dark:bg-purple-900/20 blur-[120px] rounded-full dark:mix-blend-screen animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/30 dark:bg-blue-900/20 blur-[120px] rounded-full dark:mix-blend-screen animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-red-500/30 dark:bg-red-900/10 blur-[100px] rounded-full dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <div className="max-w-[1700px] mx-auto p-4 lg:p-6 relative z-10">
                    {/* Video Player Container */}
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden group shadow-2xl ring-1 ring-border bg-black backdrop-blur-sm">
                        {/* Video Glow Effect */}
                        <div className="absolute -inset-1 bg-linear-to-r from-red-500/20 to-purple-500/20 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-1000" />

                        <div className="relative h-full w-full bg-black z-10">
                            <Image
                                src={live.thumbnail}
                                alt={live.title}
                                fill
                                className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000 ease-out"
                            />

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

                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-between p-6">
                                {/* Top Controls */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 bg-red-600/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg shadow-red-900/20 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                            </span>
                                            LIVE
                                        </div>
                                        <div className="bg-black/60 backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/90 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
                                            {Number(live.viewers).toLocaleString()} watching
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Controls */}
                                <div className="space-y-6">
                                    {/* Now Playing */}
                                    <div className="flex items-center gap-3 text-white/90 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                                        <div className="flex items-end gap-1 h-4 text-green-400">
                                            <div className="bar" />
                                            <div className="bar" />
                                            <div className="bar" />
                                            <div className="bar" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-green-400 tracking-wider uppercase">Now Playing</span>
                                            <span className="text-sm font-medium text-white shadow-black drop-shadow-md">Fransis, RAZZ - Together (feat. Eirik Naess)</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar (Fake) */}
                                    <div className="group/progress h-1 w-full bg-white/20 rounded-full cursor-pointer hover:h-1.5 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                                        <div className="h-full w-[85%] bg-red-600 rounded-full relative">
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 shadow-lg scale-0 group-hover/progress:scale-100 transition-all ring-2 ring-red-600" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                                        <div className="flex items-center gap-2">
                                            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 hover:scale-110 transition-transform">
                                                <Play className="w-8 h-8 fill-current" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10">
                                                <Volume2 className="w-6 h-6" />
                                            </Button>
                                            <div className="text-sm font-medium ml-2 px-2 py-1 bg-red-600 rounded text-white flex items-center gap-2">
                                                <span className="w-2 h-2 bg-white rounded-full" />
                                                LIVE
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10">
                                                <Settings className="w-5 h-5" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="text-white hover:bg-white/10">
                                                <Maximize2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-6">
                        <div className="space-y-4">
                            <h1 className="text-2xl font-bold leading-tight tracking-tight bg-linear-to-r from-foreground via-foreground to-foreground/50 bg-clip-text text-transparent drop-shadow-sm">
                                {live.title}
                            </h1>

                            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border">
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                                    <div className="relative group cursor-pointer shrink-0">
                                        <div className="absolute -inset-0.5 bg-linear-to-r from-pink-600 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-200"></div>
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
                                            856K subscribers
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
                                    <p className="text-blue-600 dark:text-blue-400 font-bold mb-2 group-hover/desc:text-blue-500 dark:group-hover/desc:text-blue-300 transition-colors">#BestRelaxHouse #Chillout #Study</p>
                                    <p className="mb-1">Enjoy the best relax house music! 🎧</p>
                                    <p>Don't forget to like and subscribe for more content! We stream daily with the best vibes for your workflow.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Sidebar */}
            <ChatList />
        </div>
    );
}
