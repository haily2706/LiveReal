"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    Check,
    Heart,
    MessageSquare,
    UserPlus,
    Settings,
    MoreHorizontal,
    Inbox,
    Ticket,
    Wallet,
    Radio,
    Gift,
    Calendar,
    Coins,
    Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Mock Data for "Impressive" Demo
const notifications = [
    {
        id: 1,
        type: "live",
        user: { name: "Marcus Thorne", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80" },
        content: "is live now: '2026 New Year Celebration'",
        detail: "Join 1.2k others watching",
        time: "2m ago",
        read: false,
    },
    {
        id: 2,
        type: "gift",
        user: { name: "Jessica Lin", avatar: "https://images.unsplash.com/photo-1554151228-14d9def656ec?auto=format&fit=crop&w=150&q=80" },
        content: "sent you a Super Chat gift",
        detail: "Recieved 500 LREAL Diamonds 💎",
        time: "15m ago",
        read: false,
    },
    {
        id: 4,
        type: "cashout",
        user: { name: "Wallet", avatar: "" },
        content: "Cash out processed successfully",
        detail: "Sent $450 to Bank Account ending in 4242",
        time: "30m ago",
        read: true,
    },
    {
        id: 3,
        type: "event",
        user: { name: "System", avatar: "" },
        content: "Upcoming Event Reminder",
        detail: "'Night Talk 2026' starts in 1 hour",
        time: "1h ago",
        read: true,
    },

    {
        id: 5,
        type: "video_call",
        user: { name: "Sarah Wilson", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" },
        content: "scheduled a video call",
        detail: "Dinner with friends",
        time: "5h ago",
        read: true,
    },
];


const getIcon = (type: string) => {
    switch (type) {
        case "like": return <Heart className="h-3 w-3 fill-white text-white" />;
        case "comment": return <MessageSquare className="h-3 w-3 fill-white text-white" />;
        case "follow": return <UserPlus className="h-3 w-3 fill-white text-white" />;
        case "system": return <Settings className="h-3 w-3 fill-white text-white" />;
        case "mention": return <Inbox className="h-3 w-3 fill-white text-white" />;
        case "ticket": return <Ticket className="h-3 w-3 fill-white text-white" />;
        case "wallet": return <Wallet className="h-3 w-3 fill-white text-white" />;
        case "live": return <Radio className="h-3 w-3 fill-white text-white" />;
        case "gift": return <Gift className="h-3 w-3 fill-white text-white" />;
        case "event": return <Calendar className="h-3 w-3 fill-white text-white" />;
        case "cashout": return <Coins className="h-3 w-3 fill-white text-white" />;
        case "video_call": return <Video className="h-3 w-3 fill-white text-white" />;
        default: return <Bell className="h-3 w-3 fill-white text-white" />;
    }
};

const getIconColor = (type: string) => {
    switch (type) {
        case "like": return "bg-red-500 shadow-red-500/50";
        case "comment": return "bg-blue-500 shadow-blue-500/50";
        case "follow": return "bg-green-500 shadow-green-500/50";
        case "system": return "bg-gray-500 shadow-gray-500/50";
        case "mention": return "bg-orange-500 shadow-orange-500/50";
        case "ticket": return "bg-indigo-500 shadow-indigo-500/50";
        case "wallet": return "bg-emerald-500 shadow-emerald-500/50";
        case "live": return "bg-rose-500 shadow-rose-500/50";
        case "gift": return "bg-pink-500 shadow-pink-500/50";
        case "event": return "bg-cyan-500 shadow-cyan-500/50";
        case "cashout": return "bg-yellow-500 shadow-yellow-500/50";
        case "video_call": return "bg-violet-500 shadow-violet-500/50";
        default: return "bg-gray-500";
    }
};

export function NotiDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [readState, setReadState] = useState<number[]>([]);

    // Calculate unread count based on mock data and local state
    const unreadCount = notifications.filter(n => !n.read && !readState.includes(n.id)).length;

    const handleMarkAllRead = () => {
        setReadState(notifications.map(n => n.id));
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div className="relative">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "rounded-full text-muted-foreground hover:text-foreground",
                                isOpen && "text-foreground"
                            )}
                        >
                            <Bell className="h-5 w-5" />
                        </Button>
                    </motion.div>

                    {/* Notification Badge */}
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-[10px] font-bold text-white rounded-full border-2 border-background shadow-lg shadow-red-500/20"
                            >
                                {unreadCount}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                className="w-[380px] max-w-[95vw] p-0 border-border/50 bg-background/80 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] rounded-2xl overflow-hidden"
                sideOffset={10}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">Notifications</h4>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                                {unreadCount} New
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-foreground/5"
                            title="Mark all as read"
                            onClick={handleMarkAllRead}
                        >
                            <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-foreground/5"
                        >
                            <Settings className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="h-[400px]">
                    <div className="flex flex-col">
                        <AnimatePresence>
                            {notifications.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={cn(
                                        "relative group flex gap-4 p-4 hover:bg-muted/50 transition-colors border-b border-border/40 last:border-0 cursor-pointer",
                                        !item.read && !readState.includes(item.id) && "bg-primary/5 hover:bg-primary/10"
                                    )}
                                >
                                    {/* Unread Indicator */}
                                    {!item.read && !readState.includes(item.id) && (
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-full" />
                                    )}

                                    {/* Avatar with Icon Badge */}
                                    <div className="relative shrink-0 mt-1">
                                        <div className="relative">
                                            <Avatar className="h-10 w-10 border border-border/50">
                                                <AvatarImage src={item.user.avatar} className="object-cover" />
                                                <AvatarFallback>{item.user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className={cn(
                                                "absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center border-2 border-background shadow-sm",
                                                getIconColor(item.type)
                                            )}>
                                                {getIcon(item.type)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-medium leading-none">
                                                <span className="hover:underline decoration-primary cursor-pointer transition-all">{item.user.name}</span>
                                            </p>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.time}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {item.content}
                                            {item.detail && (
                                                <span className="text-foreground/80 font-medium block mt-0.5">
                                                    {item.detail}
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Hover Action */}
                                    <div className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                                            <MoreHorizontal className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    {/* Empty State spacer */}
                    <div className="p-4 text-center">
                        <Button variant="link" className="text-xs text-muted-foreground hover:text-primary">
                            View all notifications
                        </Button>
                    </div>
                </ScrollArea>

                {/* Footer Gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-background to-transparent pointer-events-none" />
            </PopoverContent>
        </Popover>
    );
}
