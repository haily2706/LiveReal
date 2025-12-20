"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Search, UserPlus, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { startConversation, getConversations, searchUsers } from "../actions";
import { toast } from "sonner";

interface Conversation {
    id: string;
    lastMessageAt: Date | null;
    otherUser: {
        id: string;
        name: string;
        avatar: string | null;
    };
    lastMessage: {
        content: string;
        createdAt: Date;
        senderId: string;
    } | null;
}

interface SearchResult {
    id: string;
    name: string;
    avatar: string | null;
}

interface ConversationListProps {
    className?: string;
    isCollapsed?: boolean;
    onToggle?: () => void;
    allowCollapse?: boolean;
}

export function ConversationList({ className, isCollapsed, onToggle, allowCollapse }: ConversationListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedId = searchParams.get("id");

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const fetchConversations = async () => {
        try {
            const data = await getConversations();
            setConversations(data);
        } catch (err) {
            console.error("Failed to load conversations", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    // Handle search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            try {
                const results = await searchUsers(searchQuery);
                setSearchResults(results);
            } catch (error) {
                console.error("Search failed", error);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    const filteredConversations = conversations.filter(c =>
        c.otherUser.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (id: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("id", id);
        router.push(`/messages?${params.toString()}`);
    };

    const handleStartChat = async (userId: string) => {
        startTransition(async () => {
            try {
                const { conversationId } = await startConversation(userId);
                // Refresh list immediately to show new/existing conversation
                await fetchConversations();

                handleSelect(conversationId);
                setSearchQuery(""); // Clear search to show the new/existing conversation
            } catch (error) {
                toast.error("Failed to start conversation");
            }
        });
    };

    return (
        <div className={cn("flex flex-col h-full bg-background/40 backdrop-blur-xl border-r border-border/40", className)}>
            {/* Header / Search */}
            <div className={cn(
                "p-4 lg:p-6 space-y-4 transition-all duration-300 relative",
                isCollapsed && "px-3 items-center"
            )}>
                {!isCollapsed ? (
                    <>
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-pink-500 to-purple-500 w-fit">
                                Messages
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('conversation-search') as HTMLInputElement;
                                        input?.focus();
                                    }}
                                    className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                                >
                                    <UserPlus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <Input
                                id="conversation-search"
                                placeholder="Search people or messages..."
                                className="pl-10 pr-10 bg-secondary/30 border-transparent focus:bg-secondary/50 focus:border-primary/20 rounded-2xl h-11 transition-all duration-300"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-accent/50 dark:hover:bg-white/10 transition-all"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-6">
                        <button
                            onClick={() => {
                                onToggle?.();
                                setTimeout(() => {
                                    const input = document.getElementById('conversation-search') as HTMLInputElement;
                                    input?.focus();
                                }, 100);
                            }}
                            className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg shadow-primary/5"
                        >
                            <UserPlus className="h-5 w-5" />
                        </button>
                        <div className="h-px w-8 bg-border/40" />
                    </div>
                )}
            </div>

            <ScrollArea className="flex-1 px-3">
                <div className="space-y-2 pb-4">
                    {/* Search Results Section */}
                    {searchQuery && searchResults.length > 0 && (
                        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <h3 className="px-3 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest mb-3">
                                New People
                            </h3>
                            {searchResults.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => handleStartChat(user.id)}
                                    disabled={isPending}
                                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-accent/50 dark:hover:bg-white/5 active:scale-[0.98] transition-all duration-200 text-left group border border-transparent hover:border-border/50 dark:hover:border-white/5"
                                >
                                    <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary/30 transition-all duration-300">
                                        <AvatarImage src={user.avatar || undefined} className="object-cover" />
                                        <AvatarFallback className="bg-secondary text-[10px] font-bold">
                                            {user.name?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                                            {user.name}
                                        </div>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                            <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                            Tap to chat
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 border border-primary/20 group-hover:shadow-lg group-hover:shadow-primary/20">
                                        <UserPlus className="h-4.5 w-4.5" />
                                    </div>
                                </button>
                            ))}
                            <div className="h-px bg-linear-to-r from-transparent via-border/50 to-transparent my-4" />
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {loading ? (
                            <div className={cn("px-3 space-y-4", isCollapsed && "items-center")}>
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className={cn(
                                        "flex items-center gap-4 p-3 rounded-2xl animate-pulse",
                                        isCollapsed && "justify-center px-0"
                                    )}>
                                        <div className="h-12 w-12 shrink-0 rounded-full bg-muted/40" />
                                        {!isCollapsed && (
                                            <div className="flex-1 space-y-2.5 min-w-0">
                                                <div className="flex justify-between w-full">
                                                    <div className="h-4 w-24 bg-muted/40 rounded-md" />
                                                    <div className="h-3 w-10 bg-muted/30 rounded-md" />
                                                </div>
                                                <div className="h-3 w-3/4 bg-muted/30 rounded-md" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : filteredConversations.length === 0 && !searchQuery ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-64 flex flex-col items-center justify-center text-center p-4"
                            >
                                <div className="h-16 w-16 rounded-3xl bg-linear-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10 flex items-center justify-center mb-4 ring-1 ring-border/50 dark:ring-white/10 shadow-xl backdrop-blur-sm">
                                    <Search className="h-7 w-7 text-primary/70" />
                                </div>
                                <h3 className="font-semibold text-lg mb-1">No chats yet</h3>
                                <p className="text-sm text-muted-foreground">Search for someone to start chatting</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-1"
                            >
                                {searchQuery && filteredConversations.length > 0 && (
                                    <h3 className="px-3 text-xs font-bold text-muted-foreground/70 uppercase tracking-widest mb-3">
                                        Existing Chats
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {filteredConversations.map((conversation) => (
                                        <button
                                            key={conversation.id}
                                            onClick={() => handleSelect(conversation.id)}
                                            className={cn(
                                                "w-full flex items-center gap-2 p-3 rounded-2xl transition-all duration-300 text-left group relative overflow-hidden",
                                                isCollapsed && "justify-center px-2",
                                                selectedId === conversation.id
                                                    ? "bg-primary/10 border-primary/10" // Active state
                                                    : "hover:bg-muted/30 border-transparent hover:border-border/20"
                                            )}
                                        >
                                            <div className="relative shrink-0">
                                                <Avatar className={cn(
                                                    "h-12 w-12 border-1 transition-all duration-300",
                                                    selectedId === conversation.id
                                                        ? "border-primary scale-105"
                                                        : "border-transparent group-hover:border-primary/20"
                                                )}>
                                                    <AvatarImage src={conversation.otherUser.avatar || undefined} className="object-cover" />
                                                    <AvatarFallback className="bg-linear-to-br from-pink-500 via-purple-500 to-blue-500 text-white font-bold text-sm">
                                                        {conversation.otherUser.name?.[0]?.toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>

                                            {!isCollapsed && (
                                                <div className="flex-1 min-w-0 flex flex-col gap-1 z-10">
                                                    <div className="flex items-center justify-between">
                                                        <span className={cn(
                                                            "font-semibold text-sm truncate transition-colors duration-200",
                                                            selectedId === conversation.id ? "text-primary" : "text-foreground group-hover:text-foreground"
                                                        )}>
                                                            {conversation.otherUser.name}
                                                        </span>
                                                        {conversation.lastMessage?.createdAt && (
                                                            <span className={cn(
                                                                "text-[10px] font-medium shrink-0",
                                                                selectedId === conversation.id ? "text-primary/70" : "text-muted-foreground/70"
                                                            )}>
                                                                {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: false })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={cn(
                                                        "text-xs truncate font-medium",
                                                        selectedId === conversation.id
                                                            ? "text-primary/80"
                                                            : "text-muted-foreground group-hover:text-foreground/70 transition-colors"
                                                    )}>
                                                        {conversation.lastMessage?.content || "No messages yet"}
                                                    </p>
                                                </div>
                                            )}

                                            {selectedId === conversation.id && (
                                                <motion.div
                                                    layoutId="active-bg"
                                                    className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-transparent opacity-50"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </ScrollArea>
        </div>
    );
}
