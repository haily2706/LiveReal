"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, MoreVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Coin } from "@/components/ui/coin";
import { useEffect, useRef, useState } from "react";

interface Gift {
    name: string;
    emoji: string;
    coins: number;
}

interface Message {
    id: string;
    user: {
        name: string;
        avatar: string;
        color?: string;
        rank?: number;
    };
    content?: string;
    gift?: Gift;
    isTopFan?: boolean;
}

const NAMES = ["The Good Life Radio", "CHILL1432", "AlfredMayerl", "nick2", "Anam", "Arken", "Hunter", "carmlarino", "SmokeyFreestyle", "zeusgaming2837", "ANTHONY", "RichFan_99", "SuperSupporter", "PartyStarter", "KingSlayer", "GemCollector", "NewbieStart"];
const COLORS = ["text-yellow-500", "text-blue-500", "text-red-500", "text-green-500", "text-purple-500", "text-orange-500", "text-pink-500", "text-cyan-500", "text-blue-400", "text-red-400"];
const MESSAGES = ["Welcome to the stream!", "☕🎶", "👉👈", "como estas aquivose", "Afroz jisse shadi huyi aapki is she your type??", "oi sana rovna", "how young r u 💀", "entoy 😂", "she want the easy road 😆 pleas stay away 😆", "📦📦📦📦📦", "lemon 🍋", "Hunter I'm 23", "this one is better 🤷‍♀️", "cool stream", "hello!", "wow amazing"];
const GIFTS: Gift[] = [
    { name: "Balloon", emoji: "🎈", coins: 10 },
    { name: "Birthday Cake", emoji: "🎂", coins: 50 },
    { name: "Gift Box", emoji: "🎁", coins: 100 },
    { name: "Party Popper", emoji: "🎉", coins: 250 },
    { name: "Crown", emoji: "👑", coins: 500 },
    { name: "Diamond", emoji: "💎", coins: 1000 }
];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];



import { cn } from "@/lib/utils";

interface ChatListProps {
    className?: string;
    onClose?: () => void;
}

export function ChatList({ className, onClose }: ChatListProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Initial load
    useEffect(() => {
        const initialMessages = Array.from({ length: 15 }).map((_, i) => {
            const hasGift = Math.random() > 0.8;
            const gift = hasGift ? getRandomElement(GIFTS) : undefined;
            const isTopFan = Math.random() > 0.8;
            const rank = Math.random() > 0.9 ? Math.floor(Math.random() * 3) + 1 : undefined;

            return {
                id: i.toString(),
                user: {
                    name: getRandomElement(NAMES),
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
                    color: getRandomElement(COLORS),
                    rank
                },
                content: hasGift ? undefined : getRandomElement(MESSAGES),
                gift,
                isTopFan
            };
        });
        setMessages(initialMessages);
    }, []);

    // Live simulation
    useEffect(() => {
        const interval = setInterval(() => {
            const hasGift = Math.random() > 0.85;
            const gift = hasGift ? getRandomElement(GIFTS) : undefined;
            const isTopFan = Math.random() > 0.9;
            const rank = Math.random() > 0.95 ? Math.floor(Math.random() * 3) + 1 : undefined;

            const newMessage: Message = {
                id: Math.random().toString(36).substring(7),
                user: {
                    name: getRandomElement(NAMES),
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
                    color: getRandomElement(COLORS),
                    rank
                },
                content: hasGift ? undefined : getRandomElement(MESSAGES),
                gift,
                isTopFan
            };

            setMessages((prev) => {
                const updated = [...prev, newMessage];
                return updated.slice(-50); // Keep last 50 messages to prevent memory issues
            });
        }, 500 + Math.random() * 1000); // Random interval between 0.5s and 1.5s

        return () => clearInterval(interval);
    }, []);

    const totalCoins = messages.reduce((acc, message) => acc + (message.gift?.coins || 0), 0);

    return (
        <div className={cn("flex flex-col h-[600px] lg:h-full bg-background/95 backdrop-blur-3xl border-t lg:border-t-0 border-l-0 lg:border-l border-border w-full lg:w-[400px] shrink-0 relative overflow-hidden pb-20 md:pb-0", className)}>
            <div className="absolute inset-0 bg-linear-to-br from-violet-500/10 via-transparent to-fuchsia-500/10 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground tracking-wide">Top chat</span>
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <div className="h-4 w-px bg-border mx-1" />
                    <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-500">
                        <Coin className="w-4 h-4" />
                        <span>{totalCoins.toLocaleString()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                        <Crown className="w-3 h-3 fill-current" />
                        Top fans
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-full">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    <Button onClick={onClose} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 relative z-10 [&>div]:overscroll-y-contain">
                <div className="p-4 space-y-5">
                    {messages.map((message, i) => (
                        <div
                            key={message.id}
                            className="flex gap-3 items-start group"
                        >
                            <Avatar className="h-8 w-8 mt-0.5 ring-2 ring-border transition-transform group-hover:scale-110">
                                <AvatarImage src={message.user.avatar} />
                                <AvatarFallback className="text-[10px] bg-linear-to-br from-indigo-500 to-purple-600 text-white font-bold">
                                    {message.user.name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-0.5">
                                    <span className={`text-[13px] font-bold ${message.user.color} flex items-center gap-1`}>
                                        {message.user.rank && (
                                            <span className={cn(
                                                "flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold text-white shadow-xs",
                                                message.user.rank === 1 ? "bg-yellow-500 ring-1 ring-yellow-400" :
                                                    message.user.rank === 2 ? "bg-slate-400 ring-1 ring-slate-300" :
                                                        message.user.rank === 3 ? "bg-amber-700 ring-1 ring-amber-600" : "bg-slate-700"
                                            )}>
                                                {message.user.rank}
                                            </span>
                                        )}
                                        {message.user.name}
                                        {message.isTopFan && (
                                            <span className="bg-yellow-500/20 text-yellow-500 p-0.5 rounded-full" title="Top Fan">
                                                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                            </span>
                                        )}
                                    </span>
                                    {message.gift ? (
                                        <div className="flex items-center gap-3 mt-1">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-yellow-500/20 blur-lg rounded-full animate-pulse" />
                                                <span className="relative text-4xl drop-shadow-md transform transition-transform hover:scale-110 block cursor-pointer">
                                                    {message.gift.emoji}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground">
                                                    Sent <span className="text-yellow-500 font-extrabold">{message.gift.name}</span>
                                                </span>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    <Coin className="w-3.5 h-3.5" />
                                                    <span className="font-bold text-yellow-500">{message.gift.coins.toLocaleString()}</span> coins
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-[14px] text-foreground wrap-break-word leading-relaxed">
                                            {message.content}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-muted/10 -mt-1 transition-all transform translate-x-2 group-hover:translate-x-0"
                            >
                                <MoreVertical className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-background/80 backdrop-blur-md relative z-10">
                <Button className="w-full rounded-full bg-primary text-primary-foreground font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
                    Sign in to chat
                </Button>
                <div className="text-center mt-3 flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                    <span>Public Chat</span>
                    <span className="w-1 h-1 bg-white/40 rounded-full" />
                    <span>Safe Mode On</span>
                </div>
            </div>
        </div>
    );
}
