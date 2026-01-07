
"use client";

import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { GiftedButton } from "./gifted-button";
import { Gift } from "@/app/(landing)/components/gift-gallery";
import { cn } from "@/lib/utils";

interface ReactionPickerProps {
    onSelect: (emoji: string) => void;
    onGiftSelect?: (gift: Gift) => void;
    className?: string;
    hostId?: string;
    roomId?: string;
}

const REACTIONS = [
    { emoji: "💖", label: "Love" },
    { emoji: "🔥", label: "Fire" },
    { emoji: "👏", label: "Applause" },
    { emoji: "🎉", label: "Party" },
    { emoji: "🤣", label: "Haha" },
    { emoji: "😮", label: "Wow" },
    { emoji: "👍", label: "Like" },
    { emoji: "👎", label: "Dislike" }
];

export function ReactionPicker({ onSelect, onGiftSelect, className, hostId, roomId }: ReactionPickerProps) {

    return (
        <div className={cn("flex items-center justify-between w-full", className)}>
            <div className="flex gap-1 overflow-x-auto no-scrollbar mask-gradient flex-1 min-w-0">
                <TooltipProvider delayDuration={0}>
                    {REACTIONS.map(({ emoji, label }) => (
                        <Tooltip key={label}>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-9 text-xl hover:bg-muted/50 rounded-full transition-transform hover:scale-110 shrink-0"
                                    onClick={() => onSelect(emoji)}
                                >
                                    {emoji}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                {label}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </div>

            <div className="flex items-center pl-2 shrink-0">
                <div className="mr-2 w-px h-5 bg-zinc-200 dark:bg-zinc-800" />
                <TooltipProvider delayDuration={0}>
                    <GiftedButton onGiftSelect={onGiftSelect} hostId={hostId} roomId={roomId} />
                </TooltipProvider>
            </div>
        </div>
    );
}

