"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
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

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        className="group flex items-center gap-2 rounded-full bg-muted/50 hover:bg-background text-foreground border border-input hover:border-primary/50 px-3 md:px-4 transition-all duration-300 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_0_20px_-5px_rgba(0,0,0,0.1)] hover:ring-2 hover:ring-primary/10"
                        variant="ghost"
                        size="default"
                    >
                        <Video className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:text-primary" />
                        <span className="font-medium group-hover:text-primary transition-colors duration-300">Schedule</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border border-border/50 bg-background/80 backdrop-blur-xl p-2 shadow-xl">
                    {EventTypes.map((type) => (
                        <DropdownMenuItem
                            key={type.value}
                            onClick={() => {
                                setSelectedEventType(type.value);
                                setIsCreateModalOpen(true);
                            }}
                            className="flex items-center gap-3 p-3 cursor-pointer rounded-lg focus:bg-primary/5 focus:text-primary font-medium transition-all duration-200 focus:translate-x-1"
                        >
                            <type.icon className="h-5 w-5" />
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
