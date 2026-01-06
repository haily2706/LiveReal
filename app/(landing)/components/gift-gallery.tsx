"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { Coin } from "@/components/ui/coin";
import { cn } from "@/lib/utils";

export interface Gift {
    emoji: string;
    name: string;
    coins: number;
    value: string;
    color: string;
    hoverColor: string;
}


const gifts = [
    {
        emoji: "🎈",
        name: "Balloon",
        coins: 10,
        value: "$0.10",
        color: "from-red-500/30 to-pink-500/20",
        hoverColor: "hover:border-red-400/50",
    },
    {
        emoji: "🎂",
        name: "Birthday Cake",
        coins: 50,
        value: "$0.50",
        color: "from-yellow-500/20 to-orange-500/20",
        hoverColor: "hover:border-yellow-400/50",
    },
    {
        emoji: "🎁",
        name: "Gift Box",
        coins: 100,
        value: "$1.00",
        color: "from-blue-500/20 to-cyan-500/20",
        hoverColor: "hover:border-blue-400/50",
    },
    {
        emoji: "🎉",
        name: "Party Popper",
        coins: 250,
        value: "$2.50",
        color: "from-purple-500/20 to-pink-500/20",
        hoverColor: "hover:border-purple-400/50",
    },
    {
        emoji: "👑",
        name: "Crown",
        coins: 500,
        value: "$5.00",
        color: "from-yellow-500/20 to-amber-500/20",
        hoverColor: "hover:border-yellow-400/50",
    },
    {
        emoji: "💎",
        name: "Diamond",
        coins: 1000,
        value: "$10.00",
        color: "from-cyan-500/20 to-blue-500/20",
        hoverColor: "hover:border-cyan-400/50",
    },
];


interface GiftGalleryProps {
    onSelect?: (gift: Gift) => void;
    variant?: "landing" | "picker";
}

export function GiftGallery({ onSelect, variant = "landing" }: GiftGalleryProps) {
    const [hoveredGift, setHoveredGift] = useState<string | null>(null);

    const isPicker = variant === "picker";

    if (isPicker) {
        return (
            <div className="grid grid-cols-3 gap-3 p-1">
                {gifts.map((gift, index) => (
                    <motion.div
                        key={gift.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelect?.(gift)}
                        onMouseEnter={() => setHoveredGift(gift.name)}
                        onMouseLeave={() => setHoveredGift(null)}
                        className={cn(
                            "glass rounded-xl p-3 text-center cursor-pointer transition-all duration-300 border border-transparent",
                            gift.hoverColor,
                            hoveredGift === gift.name && "border-opacity-50 bg-white/5"
                        )}
                    >
                        <div className="text-4xl mb-2">{gift.emoji}</div>
                        <div className="text-xs font-semibold mb-1 truncate">{gift.name}</div>
                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-linear-to-r ${gift.color} text-[10px]`}>
                            <span>{gift.coins}</span>
                            <Coin className="w-3 h-3" />
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    }

    return (
        <section id="gifts" className="py-20 px-4 relative overflow-hidden">
            {/* Background effect */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-pink-500/5 to-transparent pointer-events-none" />

            <div className="container mx-auto max-w-6xl relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-4">
                        Virtual Gifts
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        Send & Receive{" "}
                        <span className="bg-linear-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                            Amazing Gifts
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        Your audience can send you virtual gifts during your stream that convert to real money
                    </p>
                </motion.div>

                {/* Gifts Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                    {gifts.map((gift, index) => (
                        <motion.div
                            key={gift.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            onMouseEnter={() => setHoveredGift(gift.name)}
                            onMouseLeave={() => setHoveredGift(null)}
                            className="relative"
                        >
                            <div className={`glass rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${gift.hoverColor} ${hoveredGift === gift.name ? 'scale-110 z-10' : ''}`}>
                                {/* Emoji */}
                                <motion.div
                                    animate={hoveredGift === gift.name ? {
                                        y: [0, -10, 0],
                                        rotate: [0, -5, 5, 0],
                                    } : {}}
                                    transition={{ duration: 0.5, repeat: hoveredGift === gift.name ? Infinity : 0 }}
                                    className="text-5xl md:text-6xl mb-4"
                                >
                                    {gift.emoji}
                                </motion.div>

                                {/* Name */}
                                <h3 className="font-semibold text-sm md:text-base mb-2">{gift.name}</h3>

                                {/* Value */}
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r ${gift.color}`}>
                                    <span className="text-xs font-medium">{gift.coins}</span>
                                    <Coin className="w-3.5 h-3.5" />
                                </div>

                                {/* Real Value */}
                                <p className="text-xs text-muted-foreground mt-2">
                                    = {gift.value}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Conversion Note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-1.5 text-sm text-muted-foreground mt-10 text-center"
                >
                    <span className="flex items-center gap-1.5">
                        <span>💡 100</span>
                        <Coin className="w-3.5 h-3.5" />
                        <span>= $1.00</span>
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>Withdraw earnings anytime with zero fees</span>
                </motion.p>
            </div>
        </section>
    );
}
