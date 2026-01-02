"use client";

import { useDataChannel } from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import JSConfetti from "js-confetti";

interface Reaction {
    id: string;
    emoji: string;
    x: number; // Random horizontal start position offset
    rotation: number; // Random rotation
    scale: number; // Random scale
}

interface FlyingReactionsProps {
    onReaction?: () => void;
}

export function FlyingReactions({ onReaction }: FlyingReactionsProps) {
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [decoder] = useState(() => new TextDecoder());
    const [jsConfetti, setJsConfetti] = useState<JSConfetti | null>(null);

    useEffect(() => {
        setJsConfetti(new JSConfetti());
    }, []);

    // Listen for incoming reactions
    useDataChannel("reactions", (data) => {
        const msg = decoder.decode(data.payload);
        if (msg === "🎉") {
            // Burst 1: Vibrant Colors
            jsConfetti?.addConfetti({
                confettiColors: [
                    "#ff0a54", "#ff477e", "#ff7096", "#ff85a1", "#fbb1bd", "#f9bec7",
                ],
                confettiRadius: 6,
                confettiNumber: 150,
            });
            // Burst 2: Sparkles and Magic
            jsConfetti?.addConfetti({
                emojis: ["✨", "💫", "🌸", "🔥", "💎"],
                emojiSize: 60,
                confettiNumber: 30,
            });
        }
        // Always add flying reaction for all emojis, including 🎉 (optional, but looks good to have the emoji fly too)
        addReaction(msg);
        if (onReaction) {
            onReaction();
        }
    });

    const addReaction = useCallback((emoji: string) => {
        const id = Math.random().toString(36).substring(7);
        const x = Math.random() * 80 - 40; // Random x between -40 and 40
        const rotation = Math.random() * 40 - 20; // Random rotation between -20 and 20
        const scale = 0.8 + Math.random() * 0.4; // Scale between 0.8 and 1.2

        setReactions((prev) => [
            ...prev,
            { id, emoji, x, rotation, scale },
        ]);

        // Cleanup happens automatically via onAnimationComplete/exit or we can set a timeout
        // Using onAnimationComplete in the motion component is cleaner
    }, []);

    const removeReaction = (id: string) => {
        setReactions((prev) => prev.filter((r) => r.id !== id));
    };

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
            {/* Container aligned to bottom-right area where reactions usually come from */}
            <div className="absolute bottom-20 right-8 md:right-16 w-20 h-full flex justify-center">
                <AnimatePresence>
                    {reactions.map((reaction) => (
                        <motion.div
                            key={reaction.id}
                            initial={{
                                y: 0,
                                x: reaction.x,
                                opacity: 0,
                                scale: 0.5,
                                rotate: 0
                            }}
                            animate={{
                                y: -400 - Math.random() * 200, // Fly up 400-600px
                                x: reaction.x + (Math.random() * 40 - 20), // Slight drift
                                opacity: [0, 1, 1, 0], // Fade in, stay, fade out
                                scale: reaction.scale,
                                rotate: reaction.rotation
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 2 + Math.random() * 1, // Duration 2-3s
                                ease: "easeOut"
                            }}
                            onAnimationComplete={() => removeReaction(reaction.id)}
                            className="absolute bottom-0 text-4xl select-none"
                            style={{ fontSize: "2.5rem" }}
                        >
                            {reaction.emoji}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
