"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, MoreVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
    id: string;
    user: {
        name: string;
        avatar: string;
        color?: string;
    };
    content: string;
    isTopFan?: boolean;
}

const messages: Message[] = [
    {
        id: "1",
        user: {
            name: "The Good Life Radio x Sensual Musique",
            avatar: "https://github.com/shadcn.png",
            color: "text-yellow-500",
        },
        content: "Welcome to the stream!",
        isTopFan: true,
    },
    {
        id: "2",
        user: { name: "CHILL1432", avatar: "", color: "text-blue-500" },
        content: "☕🎶",
    },
    {
        id: "3",
        user: { name: "AlfredMayerl-xb6py", avatar: "", color: "text-red-500" },
        content: "👉👈",
    },
    {
        id: "4",
        user: { name: "nick2-p6n", avatar: "", color: "text-green-500" },
        content: "como estas aquivose",
    },
    {
        id: "5",
        user: { name: "Anam-v3z-b1k", avatar: "", color: "text-purple-500" },
        content: "Afroz jisse shadi huyi aapki is she your type??",
    },
    {
        id: "6",
        user: { name: "Arken-e2i", avatar: "", color: "text-orange-500" },
        content: "oi sana rovna",
    },
    {
        id: "7",
        user: { name: "Hunter-4y3d", avatar: "", color: "text-pink-500" },
        content: "how young r u 💀",
    },
    {
        id: "8",
        user: { name: "carmlarino", avatar: "", color: "text-cyan-500" },
        content: "entoy 😂",
    },
    {
        id: "9",
        user: { name: "SmokeyFreestyle", avatar: "", color: "text-yellow-500" },
        content: "she want the easy road 😆 pleas stay away 😆 befor i break your heart XD",
    },
    {
        id: "10",
        user: { name: "zeusgaming2837", avatar: "", color: "text-blue-400" },
        content: "📦📦📦📦📦",
    },
    {
        id: "11",
        user: { name: "ANTHONY-e3w9t", avatar: "", color: "text-red-400" },
        content: "lemon 🍋",
    },
    {
        id: "12",
        user: { name: "Anam-v3z-b1k", avatar: "", color: "text-purple-500" },
        content: "Hunter I'm 23",
    },
    {
        id: "13",
        user: { name: "CHILL1432", avatar: "", color: "text-blue-500" },
        content: "this one is better 🤷‍♀️",
    },
];

export function ChatList() {
    return (
        <div className="flex flex-col h-[600px] lg:h-full bg-card/40 backdrop-blur-2xl border-t lg:border-t-0 border-l-0 lg:border-l border-border w-full lg:w-[400px] shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20 backdrop-blur-md relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground tracking-wide">Top chat</span>
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                        <Crown className="w-3 h-3 fill-current" />
                        Top fans
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-full">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/10 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 relative z-10">
                <div className="p-4 space-y-5">
                    {messages.map((message, i) => (
                        <div
                            key={message.id}
                            className="flex gap-3 items-start group animate-in slide-in-from-right-4 fade-in duration-500"
                            style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}
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
                                        {message.user.name}
                                        {message.isTopFan && (
                                            <span className="bg-yellow-500/20 text-yellow-500 p-0.5 rounded-full" title="Top Fan">
                                                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-[14px] text-foreground/80 wrap-break-word leading-relaxed group-hover:text-foreground transition-colors">
                                        {message.content}
                                    </span>
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
                </div>
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-card/40 backdrop-blur-xl relative z-10">
                <Button className="w-full rounded-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-blue-900/40 hover:shadow-blue-700/60 transition-all hover:scale-[1.02] active:scale-[0.98]">
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
