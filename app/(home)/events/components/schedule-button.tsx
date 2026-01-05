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
                        className="group flex items-center justify-center gap-2 md:rounded-full w-9 md:w-auto px-0 md:px-4 md:border md:border-input bg-transparent md:bg-muted/50 hover:bg-accent md:hover:bg-background md:text-foreground hover:text-foreground transition-colors [&_svg]:!size-5"
                        variant="ghost"
                        size="default"
                    >
                        <Video />
                        <span className="hidden md:inline font-medium">Schedule</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border border-border/50 bg-background/80">
                    {EventTypes.map((type) => (
                        <DropdownMenuItem
                            key={type.value}
                            onClick={() => {
                                setSelectedEventType(type.value);
                                setIsCreateModalOpen(true);
                            }}
                            className="flex items-center gap-3 p-3 cursor-pointer rounded-lg focus:bg-primary/5 focus:text-primary font-medium transition-all duration-200 focus:translate-x-1"
                        >
                            <type.icon className="h-6 w-6" />
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
