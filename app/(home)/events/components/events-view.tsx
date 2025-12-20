"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventTableRow } from "./event-table-row";
import { EventCard } from "./event-card"; // Import EventCard
import { ComingSoon } from "@/components/coming-soon"; // Import ComingSoon
import { Input } from "@/components/ui/input"; // Import Input
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
// import Link from "next/link"; 
import { cn } from "@/lib/utils";


import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

interface EventsViewProps {
    initialEvents: any[];
}

export function EventsView({ initialEvents }: EventsViewProps) {
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any | null>(null);
    // View mode state removed, defaulting to list view

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const searchParams = useSearchParams();

    // Reset page when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

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
    // const totalPages = Math.ceil(totalEvents / pageSize); // Unused for now
    const paginatedEvents = filteredEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="flex-1 w-full min-h-screen relative overflow-x-hidden">


            {/* Header Section - Only shown when there are events */}
            {initialEvents.length > 0 && (
                <div className="space-y-4 pt-4 pb-4 px-4 md:px-6 relative z-10 max-w-[2000px] mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                            <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-pink-500 to-purple-500 w-fit">
                                Events
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Manage and track your upcoming streams
                            </p>
                        </div>


                    </div>
                </div>
            )}

            {/* Content Section */}
            <div className="px-4 md:px-6 max-w-[2000px] mx-auto relative z-10 pb-20">
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
                        {/* Search, Filter & Pagination - Single Row */}
                        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
                            {/* Left: Search & Filter */}
                            <div className="flex items-center gap-2 w-full lg:w-auto">
                                <div className="relative w-full lg:w-80">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search events..."
                                        className="pl-9 bg-background/50 dark:bg-black/20 border-border dark:border-white/10 focus:border-brand-purple/50 transition-all text-sm h-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button variant="outline" size="sm" className="h-8 gap-1.5 px-3 bg-background/50 dark:bg-black/20 border-border dark:border-white/10 text-muted-foreground hover:text-foreground shrink-0">
                                    <div className="flex flex-col gap-0.5 w-3">
                                        <div className="h-0.5 w-full bg-current rounded-full" />
                                        <div className="h-0.5 w-2/3 bg-current rounded-full" />
                                        <div className="h-0.5 w-1/3 bg-current rounded-full" />
                                    </div>
                                    <span className="text-xs hidden sm:inline">Filter</span>
                                </Button>
                            </div>

                            {/* Right: Pagination Controls */}
                            <div className="flex items-center gap-3 sm:gap-4 w-full lg:w-auto justify-between lg:justify-end">
                                <div className="flex items-center space-x-2">
                                    <p className="text-xs font-medium text-muted-foreground whitespace-nowrap">Rows per page</p>
                                    <Select
                                        value={`${pageSize}`}
                                        onValueChange={(value) => {
                                            setPageSize(Number(value));
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="h-7 w-[60px] bg-background/50 dark:bg-black/20 border-border dark:border-white/10 text-xs">
                                            <SelectValue placeholder={pageSize} />
                                        </SelectTrigger>
                                        <SelectContent side="top">
                                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                                    {pageSize}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex w-[90px] items-center justify-center text-xs font-medium text-muted-foreground">
                                    {totalEvents > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
                                    {Math.min(currentPage * pageSize, totalEvents)} of {totalEvents}
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Button
                                        variant="outline"
                                        className="hidden h-7 w-7 p-0 bg-background/50 dark:bg-black/20 border-border dark:border-white/10 xl:flex"
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1 || totalEvents === 0}
                                    >
                                        <span className="sr-only">Go to first page</span>
                                        <ChevronsLeft className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-7 w-7 p-0 bg-background/50 dark:bg-black/20 border-border dark:border-white/10"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1 || totalEvents === 0}
                                    >
                                        <span className="sr-only">Go to previous page</span>
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-7 w-7 p-0 bg-background/50 dark:bg-black/20 border-border dark:border-white/10"
                                        onClick={() => setCurrentPage((p) => Math.min(Math.ceil(totalEvents / pageSize), p + 1))}
                                        disabled={currentPage === Math.ceil(totalEvents / pageSize) || totalEvents === 0}
                                    >
                                        <span className="sr-only">Go to next page</span>
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="hidden h-7 w-7 p-0 bg-background/50 dark:bg-black/20 border-border dark:border-white/10 xl:flex"
                                        onClick={() => setCurrentPage(Math.ceil(totalEvents / pageSize))}
                                        disabled={currentPage === Math.ceil(totalEvents / pageSize) || totalEvents === 0}
                                    >
                                        <span className="sr-only">Go to last page</span>
                                        <ChevronsRight className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

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
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block rounded-xl border border-border dark:border-white/10 bg-card/50 dark:bg-black/20 backdrop-blur-sm overflow-hidden shadow-2xl">
                                    <Table>
                                        <TableHeader className="bg-muted/50 dark:bg-black/40 hover:bg-muted/50 dark:hover:bg-black/40">
                                            <TableRow className="hover:bg-transparent border-border dark:border-white/10">
                                                <TableHead className="w-[450px] text-xs font-semibold uppercase tracking-wider text-muted-foreground">Event</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visibility</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer">
                                                    <div className="flex items-center gap-1">
                                                        Date <span className="text-[10px]">↓</span>
                                                    </div>
                                                </TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Views</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Comments</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>LREAL</span>
                                                        <Image src="/coin.svg" alt="Coin" width={14} height={14} className="brightness-110" />
                                                    </div>
                                                </TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-[200px]">Likes (vs. dislikes)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedEvents
                                                .map((event: any, index: number) => (
                                                    <EventTableRow
                                                        key={event.id}
                                                        event={event}
                                                        index={index}
                                                        isVertical={(index + 1) % 5 === 0}
                                                        onEdit={(evt) => setEditingEvent(evt)}
                                                    />
                                                ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="grid grid-cols-1 gap-4 md:hidden">
                                    {paginatedEvents.map((event: any, index: number) => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            index={index}
                                            onEdit={(evt) => setEditingEvent(evt)}
                                            isVertical={false}
                                        />
                                    ))}
                                </div>
                            </>
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
        </div >
    );
}
