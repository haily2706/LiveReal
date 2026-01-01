"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
                        className="flex items-center gap-2 rounded-full bg-muted/50 hover:bg-muted text-foreground border border-input px-3 md:px-4 transition-all"
                        variant="ghost"
                        size="default"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="font-medium">Schedule</span>
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
                            className="flex items-center gap-3 p-3 cursor-pointer rounded-lg focus:bg-muted font-medium transition-colors"
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
