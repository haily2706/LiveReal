"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Search, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EventCard } from "./event-card"; // Import EventCard
import { ComingSoon } from "@/components/coming-soon"; // Import ComingSoon
import { Input } from "@/components/ui/input"; // Import Input
// Table imports removed

import { Checkbox } from "@/components/ui/checkbox";
import { EventForm } from "./event-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    Plus,
    Video
} from "lucide-react";
// import Link from "next/link"; 
import { cn } from "@/lib/utils";


import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/components/auth/use-auth-store";

interface EventsViewProps {
    initialEvents: any[];
}

export function EventsView({ initialEvents }: EventsViewProps) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any | null>(null);
    // View mode state removed, defaulting to list view

    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchParams = useSearchParams();


    useEffect(() => {
        if (searchParams.get("action") === "create") {
            setIsCreateOpen(true);
        }
    }, [searchParams]);

    const handleOpenChange = (open: boolean) => {
        setIsCreateOpen(open);
        if (!open) {
            const params = new URLSearchParams(searchParams.toString());
            if (params.get("action") === "create") {
                params.delete("action");
                router.replace(`?${params.toString()}`);
            }
        }
    };

    // Helper to format event for form
    const formatEventForForm = (event: any) => ({
        ...event,
        startTime: new Date(event.startTime).toISOString().slice(0, 16),
        endTime: new Date(event.endTime).toISOString().slice(0, 16),
        thumbnailUrl: event.thumbnailUrl || "",
        isShort: event.isShort || false,
        hashtags: event.hashtags || "",
        visibility: event.visibility || "public",
        description: event.description || "",
        isLive: event.isLive || false,
    });

    const handleSuccess = () => {
        setIsCreateOpen(false);
        setEditingEvent(null);
        router.refresh();
    };

    const filteredEvents = initialEvents.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const totalEvents = filteredEvents.length;


    return (
        <div className="flex-1 w-full min-h-screen relative overflow-x-hidden">


            {/* Header Section - Only shown when there are events */}
            {initialEvents.length > 0 && (
                <div className="space-y-4 pt-4 pb-4 px-4 md:px-6 relative z-10 max-w-[2000px] mx-auto">
                    <div className="flex flex-row items-center justify-between gap-3">
                        <div className="space-y-0.5">
                            <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-pink-500 to-purple-500 w-fit">
                                Events
                            </h2>
                            <p className="text-sm text-muted-foreground hidden md:block">
                                Manage and track your upcoming streams
                            </p>
                        </div>




                        {/* Desktop Search & Filter & Create */}
                        <div className="flex items-center gap-2">
                            <div className="relative h-8 flex items-center">
                                <AnimatePresence initial={false} mode="wait">
                                    {isSearchOpen || searchQuery ? (
                                        <motion.div
                                            key="search-input"
                                            initial={{ width: 32, opacity: 0 }}
                                            animate={{ width: 220, opacity: 1 }}
                                            exit={{ width: 32, opacity: 0 }}
                                            className="relative w-full lg:w-80"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        >
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                            <Input
                                                autoFocus
                                                placeholder="Search events..."
                                                className="pl-9 pr-8 bg-background/50 dark:bg-black/20 border-border dark:border-white/10 focus:border-brand-purple/50 transition-all text-sm h-8 w-full"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onBlur={() => {
                                                    if (!searchQuery) setIsSearchOpen(false);
                                                }}
                                            />
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery("")}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="search-icon"
                                            initial={{ width: 320, opacity: 0 }}
                                            animate={{ width: 32, opacity: 1 }}
                                            exit={{ width: 320, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="relative"
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 shrink-0 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border relative group overflow-hidden transition-all duration-300"
                                                    onClick={() => setIsSearchOpen(true)}
                                                >
                                                    <Search className="h-4 w-4 transition-all duration-300 group-hover:text-primary" />
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 gap-1.5 px-3 bg-background/50 dark:bg-black/20 border-border dark:border-white/10 text-muted-foreground hover:text-foreground shrink-0">
                                <div className="flex flex-col gap-0.5 w-3">
                                    <div className="h-0.5 w-full bg-current rounded-full" />
                                    <div className="h-0.5 w-2/3 bg-current rounded-full" />
                                    <div className="h-0.5 w-1/3 bg-current rounded-full" />
                                </div>
                                <span className="text-xs hidden sm:inline">Filter</span>
                            </Button>
                            {user && (
                                <Button
                                    onClick={() => setIsCreateOpen(true)}
                                    className="h-8 gap-2 bg-linear-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-medium px-4 rounded-md transition-all hover:scale-105 active:scale-95"
                                >
                                    <Video className="h-4 w-4" />
                                    <span className="text-xs hidden sm:inline">Create</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )
            }

            {/* Content Section */}
            <div className="px-4 md:px-6 max-w-[2000px] mx-auto relative z-10 pb-20 pt-4 md:pt-0">
                {initialEvents.length === 0 ? (
                    <div className="h-[600px] w-full relative overflow-hidden flex items-center justify-center">
                        <ComingSoon
                            title="No events scheduled"
                            description="Your events list is empty. Start your journey by creating an innovative stream or event today."
                            icon={CalendarDays}
                        >
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-linear-to-r from-[#FF3B5C] to-purple-600 hover:opacity-90 text-white font-semibold px-6"
                            >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                Create Your First Event
                            </Button>
                        </ComingSoon>
                    </div>

                ) : (
                    <div className="space-y-4">
                        {totalEvents === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center">
                                <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                    <Search className="h-10 w-10 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-lg font-semibold">No results found</h3>
                                <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                                    We couldn't find any events matching "{searchQuery}". Try a different search term or clear the filter.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-6 h-9 px-4"
                                    onClick={() => setSearchQuery("")}
                                >
                                    Clear search
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {filteredEvents.map((event: any, index: number) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        index={index}
                                        onEdit={(evt) => setEditingEvent(evt)}
                                        isVertical={false}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-3xl p-0 overflow-hidden border-0 bg-transparent shadow-none">
                    <div className="bg-background/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="flex items-center gap-2.5 text-xl font-bold">
                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                Launch New Event
                            </DialogTitle>
                        </DialogHeader>
                        <EventForm onSuccess={handleSuccess} />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
                <DialogContent className="sm:max-w-3xl p-0 overflow-hidden border-0 bg-transparent shadow-none">
                    <div className="bg-background/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="flex items-center gap-2.5 text-xl font-bold">
                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                Refine Your Event
                            </DialogTitle>
                        </DialogHeader>
                        {editingEvent && (
                            <EventForm
                                initialData={formatEventForForm(editingEvent)}
                                isEditing
                                onSuccess={handleSuccess}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
