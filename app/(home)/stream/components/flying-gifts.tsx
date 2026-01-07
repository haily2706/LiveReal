"use client";

import { useDataChannel } from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import JSConfetti from "js-confetti";
import { toast } from "sonner";
import { Gift } from "@/app/(landing)/components/gift-gallery";

interface FlyingGift {
    id: string;
    gift: Gift;
    x: number;
    rotation: number;
    scale: number;
}

interface FlyingGiftsProps {
    onGiftReceived?: (gift: Gift) => void;
}

export function FlyingGifts({ onGiftReceived }: FlyingGiftsProps) {
    const [gifts, setGifts] = useState<FlyingGift[]>([]);
    const [decoder] = useState(() => new TextDecoder());
    const [jsConfetti, setJsConfetti] = useState<JSConfetti | null>(null);

    useEffect(() => {
        setJsConfetti(new JSConfetti());
    }, []);

    const addGift = useCallback((gift: Gift) => {
        const id = Math.random().toString(36).substring(7);
        const x = Math.random() * 200 - 100; // Wider spread
        const rotation = Math.random() * 40 - 20;
        const scale = 1.0 + Math.random() * 0.5;

        setGifts((prev) => [
            ...prev,
            { id, gift, x, rotation, scale },
        ]);
    }, []);

    const onGiftReceivedRef = useRef(onGiftReceived);
    useEffect(() => {
        onGiftReceivedRef.current = onGiftReceived;
    }, [onGiftReceived]);

    const handleDataMessage = useCallback((data: any) => {
        console.log("FlyingGifts received data", data);
        try {
            const payloadStr = decoder.decode(data.payload);
            console.log("FlyingGifts payloadStr", payloadStr);
            toast("Debug: Received Gift Data"); // VISUAL DEBUG
            const payload = JSON.parse(payloadStr);

            let gift: Gift | null = null;

            // Handle new server action format
            if (payload.type === "GIFT_RECEIVED" && payload.data?.gift) {
                gift = payload.data.gift as Gift;
            }
            // Handle legacy/direct format (if any)
            else if (payload.emoji && payload.name && payload.coins) {
                gift = payload as Gift;
            }

            if (!gift) return;

            // Add Confetti Effect
            const isBigGift = gift.coins >= 100;

            jsConfetti?.addConfetti({
                emojis: [gift.emoji],
                emojiSize: isBigGift ? 100 : 70,
                confettiNumber: isBigGift ? 40 : 20,
            });

            if (isBigGift) {
                jsConfetti?.addConfetti({
                    confettiColors: [
                        '#ffd700', '#ffa500', '#ff0000', '#ff0a54', '#ffffff',
                    ],
                    confettiRadius: 8,
                    confettiNumber: 100,
                });
            }

            addGift(gift);
            if (onGiftReceivedRef.current) {
                onGiftReceivedRef.current(gift);
            }
        } catch (e) {
            console.error("Failed to parse gift data", e);
        }
    }, [decoder, jsConfetti, addGift]);

    useDataChannel(handleDataMessage);

    const removeGift = (id: string) => {
        setGifts((prev) => prev.filter((r) => r.id !== id));
    };

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[100]">


            <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-0 h-0 flex justify-center items-end">
                <AnimatePresence>
                    {gifts.map(({ id, gift, x, rotation, scale }) => (
                        <motion.div
                            key={id}
                            initial={{
                                y: 100,
                                x: x,
                                opacity: 0,
                                scale: 0.5,
                                rotate: 0
                            }}
                            animate={{
                                y: -600,
                                x: x * 1.5,
                                opacity: [0, 1, 1, 0],
                                scale: scale,
                                rotate: rotation
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 3.5,
                                ease: "easeOut"
                            }}
                            onAnimationComplete={() => removeGift(id)}
                            className="absolute flex flex-col items-center"
                        >
                            <div className="text-8xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] filter">
                                {gift.emoji}
                            </div>
                            <div className="mt-4 text-2xl font-black text-white px-6 py-2 rounded-full border-2 border-white/20 shadow-[0_0_20px_rgba(255,165,0,0.5)] bg-linear-to-r from-yellow-500/80 to-pink-500/80 backdrop-blur-md whitespace-nowrap">
                                {gift.name}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
