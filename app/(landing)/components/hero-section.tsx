"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cake, Gift, Sparkles, Play, Users, DollarSign, Globe } from "lucide-react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faApple, faAndroid, faChrome } from "@fortawesome/free-brands-svg-icons";

import { EventTypes } from "@/lib/constants";

const RotatingText = () => {
    const items = EventTypes.map(type => ({
        text: type.name,
        color: type.color
    }));
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % items.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <span className="inline-grid grid-cols-1 place-items-center h-[1.2em] align-top overflow-hidden mx-2">
            <span className="opacity-0 col-start-1 row-start-1 invisible pointer-events-none">Birthday</span>
            <AnimatePresence mode="wait">
                <motion.span
                    key={index}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className={`col-start-1 row-start-1 bg-clip-text text-transparent animate-gradient bg-300% ${items[index].color}`}
                >
                    {items[index].text}
                </motion.span>
            </AnimatePresence>
        </span>
    );
};

export function HeroSection() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 px-4">
            {/* Background effect */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-pink-500/5 to-transparent pointer-events-none" />
            {/* Floating decorative elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute top-20 left-[10%] text-4xl"
                    animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    🎈
                </motion.div>
                <motion.div
                    className="absolute top-32 right-[15%] text-5xl"
                    animate={{ y: [0, -15, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                    🎂
                </motion.div>
                <motion.div
                    className="absolute bottom-40 left-[20%] text-4xl"
                    animate={{ y: [0, -25, 0], rotate: [0, 15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                    🎁
                </motion.div>
                <motion.div
                    className="absolute bottom-32 right-[10%] text-5xl"
                    animate={{ y: [0, -18, 0], rotate: [0, -10, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                >
                    🎉
                </motion.div>
                <motion.div
                    className="absolute top-1/2 left-[5%] text-3xl"
                    animate={{ y: [0, -12, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                >
                    ✨
                </motion.div>
                <motion.div
                    className="absolute top-1/3 right-[8%] text-3xl"
                    animate={{ y: [0, -15, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                >
                    🌟
                </motion.div>
            </div>

            <div className="container mx-auto max-w-6xl text-center relative z-10">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-pink-600 dark:text-pink-400">
                        <Sparkles className="w-4 h-4" />
                        The Future of Celebrations
                    </span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
                >
                    Turn Your <RotatingText /> Into
                    <br />
                    <span className="bg-linear-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                        a Live Experience
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
                >
                    Stream your celebration, connect with your audience worldwide,
                    and receive virtual gifts that convert to real money.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
                >
                    <Button
                        size="lg"
                        className="h-14 px-8 text-lg bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 animate-pulse-glow rounded-2xl text-white"
                        asChild
                    >
                        <Link href="/home">
                            <Cake className="mr-2 h-5 w-5" />
                            Start Streaming Free
                        </Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="h-14 px-8 text-lg border-pink-500/50 hover:bg-pink-500/10 rounded-2xl"
                        asChild
                    >
                        <Link href="/home">
                            <Play className="mr-2 h-5 w-5" />
                            Watch Demo
                        </Link>
                    </Button>
                </motion.div>

                {/* Platform Availability */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.35 }}
                    className="flex justify-center items-center gap-4 mb-8 text-muted-foreground"
                >
                    <span className="text-sm font-medium mr-2 hidden md:inline">Available on:</span>
                    <div className="flex items-center gap-6">
                        <Link href="/home" className="flex items-center gap-2 hover:text-foreground transition-colors duration-300" title="Web">
                            <FontAwesomeIcon icon={faChrome} className="w-5 h-5" />
                            <span className="text-sm">Web</span>
                        </Link>
                        <Link href="/home" className="flex items-center gap-2 hover:text-foreground transition-colors duration-300" title="iOS">
                            <FontAwesomeIcon icon={faApple} className="w-5 h-5" />
                            <span className="text-sm">iOS</span>
                        </Link>
                        <Link href="/home" className="flex items-center gap-2 hover:text-foreground transition-colors duration-300" title="Android">
                            <FontAwesomeIcon icon={faAndroid} className="w-5 h-5" />
                            <span className="text-sm">Android</span>
                        </Link>
                    </div>
                </motion.div>

                {/* Stats/Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="flex flex-wrap justify-center gap-8 md:gap-12"
                >
                    <div className="flex items-center gap-3 glass px-5 py-3 rounded-2xl">
                        <Users className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                        <div className="text-left">
                            <p className="text-2xl font-bold">100K+</p>
                            <p className="text-sm text-muted-foreground">Streamers</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 glass px-5 py-3 rounded-2xl">
                        <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <div className="text-left">
                            <p className="text-2xl font-bold">1M+</p>
                            <p className="text-sm text-muted-foreground">Gifts Sent</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 glass px-5 py-3 rounded-2xl">
                        <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        <div className="text-left">
                            <p className="text-2xl font-bold">$5M+</p>
                            <p className="text-sm text-muted-foreground">Earned</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 glass px-5 py-3 rounded-2xl">
                        <Globe className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                        <div className="text-left">
                            <p className="text-2xl font-bold">50+</p>
                            <p className="text-sm text-muted-foreground">Countries</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
