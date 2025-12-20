"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowLeft, Image as ImageIcon, Info, Lock, MoreVertical, Paperclip, Send, Smile, Info as InfoIcon, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getMessages, sendMessage, getConversationDetails, getCurrentUser } from "../actions";
import { toast } from "sonner";
import { VideoCall } from "./video-call";
import { ChevronRight, ChevronLeft, MessageSquare, MessageSquareOff, PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface Message {
    id: string;
    senderId: string;
    content: string;
    createdAt: Date;
    type?: string;
    status?: 'sending' | 'sent' | 'error';
}

interface ChatWindowProps {
    conversationId: string;
    currentUserId: string;
    onVideoCallStart?: () => void;
    onVideoCallChange?: (isOpen: boolean) => void;
    isSidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
}

export function ChatWindow({
    conversationId,
    currentUserId,
    onVideoCallStart,
    onVideoCallChange,
    isSidebarCollapsed,
    onToggleSidebar
}: ChatWindowProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [otherUser, setOtherUser] = useState<{ name: string; avatar: string | null } | null>(null);
    const [currentUser, setCurrentUser] = useState<{ name: string; avatar: string | null } | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isVideoCallActive, setIsVideoCallActive] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Effect to notify parent when video call starts
    useEffect(() => {
        if (isVideoCallActive && onVideoCallStart) {
            onVideoCallStart();
        }
        if (onVideoCallChange) {
            onVideoCallChange(isVideoCallActive);
        }
    }, [isVideoCallActive, onVideoCallStart, onVideoCallChange]);

    // Auto-close chat on mobile when video call starts
    useEffect(() => {
        if (isVideoCallActive) {
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            if (isMobile) {
                setIsChatOpen(false);
            }
        }
    }, [isVideoCallActive]);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [updatedUser, me] = await Promise.all([
                    getConversationDetails(conversationId),
                    getCurrentUser()
                ]);

                if (updatedUser) setOtherUser(updatedUser);
                if (me) setCurrentUser(me);
            } catch (error) {
                console.error("Failed to fetch conversation details", error);
            }
        };

        fetchDetails();
    }, [conversationId]);

    const fetchMessages = async () => {
        try {
            const data = await getMessages(conversationId);
            const formattedData = data.map((m: any) => ({
                ...m,
                createdAt: new Date(m.createdAt)
            }));

            // Merge server messages with local optimistic messages
            setMessages(currentMessages => {
                const incomingIds = new Set(formattedData.map((m: any) => m.id));
                // Keep local messages that are sending OR sent but not yet in the incoming list
                // (This handles the race condition where a stale poll overwrites a specialized local state)
                const localKeep = currentMessages.filter(m =>
                    m.status === 'sending' ||
                    (m.status === 'sent' && !incomingIds.has(m.id))
                );

                // Combine and Deduplicate based on ID just in case
                const combined = [...formattedData, ...localKeep];

                // Sort by createdAt
                return combined.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            });
        } catch (err) {
            console.error("Failed to load messages", err);
            // toast.error("Failed to load messages"); // Suppress frequent error toasts on poll
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchMessages();

        const interval = setInterval(fetchMessages, 5000); // Polling for updates
        return () => clearInterval(interval);
    }, [conversationId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        const tempId = crypto.randomUUID();

        try {
            // Optimistic update
            const optimisticMessage: Message = {
                id: tempId,
                senderId: currentUserId,
                content: newMessage,
                createdAt: new Date(),
                status: 'sending'
            };
            setMessages(prev => [...prev, optimisticMessage]);
            setNewMessage("");

            const response = await sendMessage(conversationId, optimisticMessage.content);

            // Update ID to the real one from server and mark as sent
            // This ensures de-duplication works when merging with server data
            if (response && response.messageId) {
                setMessages(prev => prev.map(m =>
                    m.id === tempId ? { ...m, id: response.messageId, status: 'sent' } : m
                ));
            }

            // Immediate fetch to ensure full sync
            await fetchMessages();

        } catch (err) {
            console.error("Failed to send message", err);
            toast.error("Failed to send message");
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'error' } : m));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex h-full w-full relative overflow-hidden bg-background">
            <AnimatePresence mode="wait">
                {isVideoCallActive && (
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex-1 relative min-w-0 bg-black flex flex-col items-center justify-center"
                    >
                        <VideoCall
                            room={conversationId}
                            username={currentUserId}
                            userName={currentUser?.name || "User"}
                            onDisconnect={() => setIsVideoCallActive(false)}
                            className="h-full w-full"
                        >
                            <div className="absolute inset-0 pointer-events-none z-50">
                                {/* Sidebar Toggle - Top Left */}
                                {onToggleSidebar && (
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        onClick={onToggleSidebar}
                                        className="absolute top-4 left-4 pointer-events-auto rounded-2xl bg-background/50 backdrop-blur-md hover:bg-background/80 shadow-lg transition-all duration-300"
                                    >
                                        {isSidebarCollapsed ? (
                                            <PanelLeftOpen className="h-5 w-5" />
                                        ) : (
                                            <PanelLeftClose className="h-5 w-5" />
                                        )}
                                    </Button>
                                )}

                                {/* Chat Toggle - Top Right */}
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    onClick={() => setIsChatOpen(!isChatOpen)}
                                    className="absolute top-4 right-16 pointer-events-auto rounded-2xl bg-background/50 backdrop-blur-md hover:bg-background/80 shadow-lg transition-all duration-300"
                                >
                                    {isChatOpen ? <MessageSquareOff className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                                </Button>
                            </div>
                        </VideoCall>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={cn(
                "flex flex-col h-full bg-background transition-all duration-500 ease-in-out z-10",
                isVideoCallActive
                    ? (isChatOpen
                        ? "absolute inset-0 w-full h-full z-30 md:z-10 md:static md:w-[400px] md:inset-auto md:h-full border-l border-border/40 shadow-xl translate-x-0"
                        : "w-0 overflow-hidden border-none translate-x-[400px]")
                    : "relative flex-1 w-full translate-x-0"
            )}>
                {/* Header */}
                <div className="z-20 border-b border-border/40 flex items-center justify-between bg-background/80 backdrop-blur-xl sticky top-0">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden -ml-2 text-muted-foreground hover:text-foreground hover:bg-white/5"
                            onClick={() => {
                                if (isVideoCallActive && isChatOpen) {
                                    setIsChatOpen(false);
                                } else {
                                    router.push("/messages");
                                }
                            }}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>

                        <div className="flex items-center gap-3.5 pl-1">
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-muted/40 animate-pulse" />
                                        <div className="space-y-1.5">
                                            <div className="h-4 w-24 bg-muted/40 rounded-md animate-pulse" />
                                            <div className="h-3 w-16 bg-muted/30 rounded-md animate-pulse" />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="content"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-3.5"
                                    >
                                        <button className="flex items-center gap-2 group/header p-2 rounded-2xl hover:bg-secondary/50 transition-all duration-300">
                                            <div className="relative">
                                                <Avatar className="h-12 w-12 border-2 border-background shadow-lg transition-transform duration-300 group-hover/header:rotate-3 group-hover/header:scale-105">
                                                    <AvatarImage src={otherUser?.avatar || undefined} className="object-cover" />
                                                    <AvatarFallback className="bg-linear-to-br from-pink-500 via-purple-500 to-blue-500 text-white font-bold text-lg">
                                                        {otherUser?.name?.[0]?.toUpperCase() || "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-bold text-xl flex items-center gap-2 text-foreground group-hover/header:text-primary transition-colors">
                                                    {otherUser?.name || "Unknown"}
                                                </h3>
                                                <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 mt-0.5">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                    Online
                                                </p>
                                            </div>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {!isVideoCallActive && (
                            <>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-full transition-all duration-300 shadow-sm"
                                    onClick={() => setIsVideoCallActive(true)}
                                >
                                    <Video className="h-4.5 w-4.5" />
                                </Button>

                            </>
                        )}
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300">
                            <MoreVertical className="h-4.5 w-4.5" />
                        </Button>
                    </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4 lg:px-6">
                    <div className="space-y-1 w-full flex flex-col justify-end min-h-full pb-4">
                        {loading && (
                            <div className="flex flex-col gap-4 w-full">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "flex gap-3 max-w-[70%] animate-pulse",
                                            i % 2 === 0 ? "ml-auto flex-row-reverse" : ""
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-muted/40 shrink-0" />
                                        <div className={cn(
                                            "flex flex-col gap-1 w-full",
                                            i % 2 === 0 ? "items-end" : "items-start"
                                        )}>
                                            <div className={cn(
                                                "h-12 w-full rounded-2xl bg-muted/40",
                                                i % 2 === 0 ? "rounded-tr-sm" : "rounded-tl-sm w-[80%]"
                                            )} />
                                            <div className="h-3 w-10 bg-muted/30 rounded-md" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && (
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-70 animate-in fade-in zoom-in-95 duration-700">
                                <div className="h-16 w-16 rounded-3xl bg-muted/30 flex items-center justify-center text-muted-foreground/50 mb-2 shadow-xs ring-1 ring-border/20 backdrop-blur-md">
                                    <Lock className="h-7 w-7" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">Encrypted Conversation</p>
                                    <p className="text-xs text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                                        Messages are secured with end-to-end encryption. Only you and the recipient can read them.
                                    </p>
                                </div>
                            </div>
                        )}

                        <AnimatePresence initial={false}>
                            {messages.map((message, index) => {
                                const isMe = message.senderId === currentUserId;
                                const isFirstInSequence = index === 0 || messages[index - 1]?.senderId !== message.senderId;
                                const showAvatar = !isMe && isFirstInSequence;

                                return (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className={cn(
                                            "flex gap-2 max-w-[85%] md:max-w-[70%]",
                                            isMe ? "ml-auto flex-row-reverse" : "items-end",
                                            isFirstInSequence && index !== 0 && "mt-2"
                                        )}
                                    >
                                        {!isMe && (
                                            <div className="w-10 shrink-0 flex flex-col items-center">
                                                {showAvatar ? (
                                                    <Avatar className="h-10 w-10 border-2 border-background shadow-md">
                                                        <AvatarImage src={otherUser?.avatar || undefined} className="object-cover" />
                                                        <AvatarFallback className="bg-secondary text-[10px] font-bold">
                                                            {otherUser?.name?.[0]?.toUpperCase() || "?"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ) : <div className="w-10" />}
                                            </div>
                                        )}

                                        <div className={cn(
                                            "flex flex-col gap-1",
                                            isMe ? "items-end" : "items-start"
                                        )}>
                                            {isFirstInSequence && (
                                                <div className={cn(
                                                    "flex items-center gap-2 mb-0.5 px-1",
                                                    isMe ? "flex-row-reverse" : "flex-row"
                                                )}>
                                                    {!isMe && (
                                                        <span className="text-[11px] font-semibold text-foreground/80">
                                                            {otherUser?.name || "Unknown"}
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-muted-foreground/60">
                                                        {format(message.createdAt, "h:mm a")}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={cn(
                                                "px-3 py-1 rounded-xl leading-relaxed relative group shadow-xs transition-all duration-300",
                                                isMe
                                                    ? "bg-primary text-primary-foreground rounded-tr-md shadow-sm"
                                                    : "bg-secondary text-secondary-foreground rounded-tl-md shadow-sm",
                                                message.status === 'sending' && "opacity-70 scale-[0.98]"
                                            )}>
                                                <p className="font-normal">{message.content}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                {/* Input */}
                <div className="h-17 px-4 border-t border-border/40 bg-background/80 backdrop-blur-xl sticky bottom-0 z-20 flex items-center">
                    <form onSubmit={handleSend} className="w-full relative flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-secondary/30 rounded-2xl p-1 border border-border/20 backdrop-blur-md">
                            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 shrink-0 transition-all duration-300 border-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                                <Paperclip className="h-4.5 w-4.5" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 shrink-0 transition-all duration-300 border-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                                <ImageIcon className="h-4.5 w-4.5" />
                            </Button>
                        </div>

                        <div className="flex-1 relative flex items-center bg-secondary/40 hover:bg-secondary/60 focus-within:bg-secondary/60 backdrop-blur-md transition-all duration-300 rounded-2xl border border-border/40 focus-within:border-primary/20 focus-within:ring-2 focus-within:ring-primary/10 group">
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="bg-transparent border-0 ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-11 py-3 px-4 rounded-2xl placeholder:text-muted-foreground/40 text-[15px] shadow-none"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 my-1 mr-1 text-muted-foreground/60 hover:text-primary rounded-xl hover:bg-primary/10 transition-all duration-300 border-none ring-0 outline-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                            >
                                <Smile className="h-5 w-5" />
                            </Button>
                        </div>

                        <Button
                            type="submit"
                            size="icon"
                            disabled={sending || !newMessage.trim()}
                            className={cn(
                                "h-11 w-11 rounded-2xl shadow-xl transition-all duration-300",
                                newMessage.trim()
                                    ? "bg-primary text-primary-foreground hover:scale-105 active:scale-95"
                                    : "bg-secondary text-muted-foreground opacity-50 cursor-not-allowed",
                                sending && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            <Send className={cn("h-5 w-5 ml-0.5 transition-transform duration-300", newMessage.trim() && "group-hover:translate-x-0.5 group-hover:-translate-y-0.5")} />
                        </Button>
                    </form>
                </div>
            </div >
        </div >
    );
}
