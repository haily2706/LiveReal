"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EventTypes } from "@/lib/constants";
import { CreateEventModal } from "./create-event-modal";

export function ScheduleButton() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedEventType, setSelectedEventType] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <div className="relative hidden md:block">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                        >
                            <Button
                                className={cn(
                                    "group flex items-center justify-center gap-2 md:rounded-full w-9 md:w-auto px-0 md:px-4 border border-border relative overflow-hidden transition-all duration-300",
                                    // Base styles matching noti-dropdown but keeping responsive width
                                    "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
                                    // Active state styles
                                    isOpen && "bg-primary/10 text-primary border-primary/20",
                                    // Ensure generic styles don't override
                                    "[&_svg]:size-5!"
                                )}
                                variant="ghost"
                                size="default"
                            >
                                <Video className={cn(
                                    "h-5 w-5 transition-all duration-300",
                                    isOpen ? "fill-primary/20 text-primary" : "group-hover:text-primary"
                                )} />
                                <span className="hidden md:inline font-medium">Schedule</span>

                                {/* Ripple Effect Background on Active */}
                                {isOpen && (
                                    <span className="absolute inset-0 bg-primary/10 animate-ping rounded-full opacity-20" />
                                )}
                            </Button>
                        </motion.div>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border border-border/50 bg-background/80 backdrop-blur-2xl">
                    {EventTypes.filter(t => t.value !== 5).map((type) => (

                        <DropdownMenuItem
                            key={type.value}
                            onClick={() => {
                                setSelectedEventType(type.value);
                                setIsCreateModalOpen(true);
                                setIsOpen(false);
                            }}
                            className="flex items-center gap-3 p-3 cursor-pointer rounded-lg focus:bg-primary/5 focus:text-primary font-medium transition-all duration-200 focus:translate-x-1"
                        >
                            <type.icon className="size-8" />
                            {type.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <CreateEventModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                initialEventType={selectedEventType}
            />
        </>
    );
}
