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
    Inbox
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
        type: "like",
        user: { name: "Isabella Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
        content: "liked your latest video",
        detail: "The Cyberpunk City Cinematic",
        time: "2m ago",
        read: false,
    },
    {
        id: 2,
        type: "comment",
        user: { name: "Marcus Thorne", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80" },
        content: "commented on your post",
        detail: "\"This is absolutely mind-blowing! 🤯\"",
        time: "15m ago",
        read: false,
    },
    {
        id: 3,
        type: "follow",
        user: { name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" },
        content: "started following you",
        time: "1h ago",
        read: true,
    },
    {
        id: 4,
        type: "system",
        user: { name: "System", avatar: "" },
        content: "Your video was boosted!",
        detail: "Trending in 3 countries 🚀",
        time: "3h ago",
        read: true,
    },
    {
        id: 5,
        type: "mention",
        user: { name: "Sarah Wilson", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" },
        content: "mentioned you in a comment",
        detail: "@CyberCreator check this out!",
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
        default: return <Bell className="h-3 w-3 fill-white text-white" />;
    }
};

const getIconColor = (type: string) => {
    switch (type) {
        case "like": return "bg-red-500 shadow-red-500/50";
        case "comment": return "bg-blue-500 shadow-blue-500/50";
        case "follow": return "bg-green-500 shadow-green-500/50";
        case "system": return "bg-purple-500 shadow-purple-500/50";
        case "mention": return "bg-orange-500 shadow-orange-500/50";
        default: return "bg-gray-500";
    }
};

export function NotificationDropdown() {
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
                                "shrink-0 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border relative group overflow-hidden transition-all duration-300",
                                isOpen && "bg-primary/10 text-primary border-primary/20"
                            )}
                        >
                            <Bell className={cn(
                                "h-5 w-5 transition-all duration-300",
                                isOpen ? "fill-primary/20 text-primary" : "group-hover:text-yellow-500 dark:group-hover:text-yellow-400"
                            )} />

                            {/* Ripple Effect Background on Active */}
                            {isOpen && (
                                <span className="absolute inset-0 bg-primary/10 animate-ping rounded-full opacity-20" />
                            )}
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
                className="w-[380px] p-0 border-border/50 bg-background/80 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] rounded-2xl overflow-hidden"
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
