
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

export function ReactionPicker({ onSelect, onGiftSelect, className }: ReactionPickerProps) {

    return (
        <div className={cn("flex gap-1 overflow-x-auto no-scrollbar mask-gradient", className)}>
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

                <div className="mx-1.5 w-px h-5 bg-zinc-200 dark:bg-zinc-800 self-center" />
                <GiftedButton onGiftSelect={onGiftSelect} />
            </TooltipProvider>
        </div>
    );
}

