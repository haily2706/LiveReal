"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { MessageCircle, Video, Sparkles, Radio, Send, Heart, Gift } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";

export function EphemeralFeatureSection() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Keeping the scroll hook even if we don't use it for the right side, strictly for the left side if needed or future use
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    return (
        <section ref={containerRef} className="py-12 md:py-18 md:pt-12 md:pb-18 px-4 relative overflow-hidden">
            {/* Background effect */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-orange-500/5 to-transparent pointer-events-none" />

            <div className="container mx-auto max-w-6xl">
                <div className="grid lg:grid-cols-12 gap-2 md:gap-12 items-center">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10 text-left lg:col-span-4 flex flex-col items-center lg:items-start"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass text-sm font-medium text-orange-600 dark:text-orange-400">
                                Ephemeral
                            </span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight text-center lg:text-left">
                            Moments That{" "}
                            <span className="relative inline-block">
                                <span className="relative bg-linear-to-r from-orange-500 via-rose-500 to-amber-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                                    Fade Forever
                                </span>
                            </span>
                        </h2>

                        <p className="text-lg text-muted-foreground mb-12 leading-relaxed max-w-xl text-center lg:text-left">
                            Experience true digital freedom. Our platform is built on the principle of impermanence live streams, and chats that exist only in the moment and vanish without a trace.
                        </p>
                    </motion.div>

                    {/* Visual/Demo Side - Grid Layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full lg:col-span-8">

                        {/* 1. Live Stream Demo Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0 }}
                            className="group relative"
                        >
                            <div className="absolute -inset-1 rounded-2xl bg-linear-to-b from-purple-500/20 to-cyan-500/20 blur-md opacity-0 group-hover:opacity-100 transition duration-500" />
                            <div className="glass rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden relative h-full flex flex-col bg-white/40 dark:bg-black/40">

                                {/* Visual Area */}
                                <div className="relative h-48 sm:h-56 bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                                    <div className="absolute inset-0 bg-linear-to-tr from-purple-500/10 via-transparent to-cyan-500/10 opacity-50" />

                                    {/* Stream Overlay */}
                                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                                        <div className="flex items-center gap-2">
                                            <Image src="/coin.svg" alt="LiveReal" width={32} height={32} className="w-8 h-8 rounded-full border border-white/20" />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-neutral-900 dark:text-white">LiveReal</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                    <span className="text-[10px] text-neutral-600 dark:text-white/70">Live</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-2 py-1 rounded-full bg-white/60 dark:bg-black/40 backdrop-blur-md border border-black/5 dark:border-white/10 text-[10px] text-neutral-900 dark:text-white font-medium">
                                            12.5k
                                        </div>
                                    </div>

                                    {/* Play Button / Placeholder */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full animate-pulse" />
                                            <Video className="w-12 h-12 text-neutral-400 dark:text-white/20 relative z-10" />
                                        </div>
                                    </div>

                                    {/* Flying Reactions Effect */}
                                    <FlyingReactions />

                                    <div className="absolute bottom-2 left-4 z-10">
                                        <div className="px-2 py-1 rounded-md bg-purple-500/20 border border-purple-500/30 text-[10px] text-purple-700 dark:text-purple-300 flex items-center gap-1.5 font-medium">
                                            <Sparkles className="w-3 h-3" />
                                            No Recording
                                        </div>
                                    </div>
                                </div>

                                {/* Content Info */}
                                <div className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
                                            <Radio className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Live Stream</h3>
                                    </div>
                                    <p className="text-sm text-neutral-600 dark:text-white/50 leading-relaxed">
                                        Live today, gone forever. Streams leave no digital footprint.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Ghost Chat Demo Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="group relative"
                        >
                            <div className="absolute -inset-1 rounded-2xl bg-linear-to-b from-cyan-500/20 to-blue-500/20 blur-md opacity-0 group-hover:opacity-100 transition duration-500" />
                            <div className="glass rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden relative h-full flex flex-col bg-white/40 dark:bg-black/40">

                                {/* Visual Area */}
                                <div className="relative h-56 sm:h-56 bg-neutral-100/50 dark:bg-neutral-900/50 overflow-hidden flex flex-col">
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50" />

                                    <div className="flex-1 p-4 flex flex-col justify-center relative mask-image-linear-to-t">
                                        <AnimatePresence mode="popLayout">
                                            <ChatSimulation mode="chat" />
                                        </AnimatePresence>
                                    </div>

                                    {/* Input Fake */}
                                    <div className="p-4 pb-2 pt-0 z-10">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 flex-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
                                            <div className="w-8 h-8 rounded-full bg-cyan-600/20 flex items-center justify-center text-cyan-400">
                                                <Send className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Info */}
                                <div className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                            <MessageCircle className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Ghost Chat</h3>
                                    </div>
                                    <p className="text-sm text-neutral-600 dark:text-white/50 leading-relaxed">
                                        Conversations that evaporate. Zero logs, absolute privacy.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                    </div>

                </div>
            </div>
        </section>
    );
}

function ChatSimulation({ mode = 'stream' }: { mode?: 'stream' | 'chat' }) {
    const allMessages = [
        { user: "Leo", text: "Is this recorded?", color: "text-cyan-600 dark:text-cyan-400", type: "stream" },
        { user: "Sarah", text: "Nope, fully ephemeral! 👻", color: "text-pink-600 dark:text-pink-400", type: "stream" },
        { user: "Mike", text: "Love this privacy feature.", color: "text-green-600 dark:text-green-400", type: "stream" },
        { user: "Anna", text: "Wait, so it's gone after?", color: "text-purple-600 dark:text-purple-400", type: "stream" },
        { user: "Host", text: "Exactly. No history. 🤫", color: "text-yellow-600 dark:text-yellow-400", type: "stream" },

        { user: "Me", text: "Hey! Did you see the new update?", color: "text-green-600 dark:text-green-400", type: "chat", self: true },
        { user: "Jamie", text: "The self-destructing messages?", color: "text-blue-600 dark:text-blue-400", type: "chat" },
        { user: "Me", text: "It's insane. 🔥", color: "text-green-600 dark:text-green-400", type: "chat", self: true },
        { user: "Jamie", text: "Poof and gone. 💨", color: "text-blue-600 dark:text-blue-400", type: "chat" },
    ];

    // Filter messages based on active mode
    const messages = allMessages.filter(m => m.type === (mode === 'chat' ? 'chat' : 'stream'));

    const [visibleMessages, setVisibleMessages] = useState<Array<{ id: number, user: string, text: string, color: string }>>([]);
    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % messages.length);
            const newMsg = { ...messages[msgIndex], id: Date.now() };

            setVisibleMessages(prev => {
                const updated = [...prev, newMsg];
                return updated.slice(-4); // Keep last 4 max
            });

            // Auto remove after 3 seconds to simulate fade
            setTimeout(() => {
                setVisibleMessages(prev => prev.filter(m => m.id !== newMsg.id));
            }, 3000);

        }, 1500);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [msgIndex]);

    return (
        <>
            {visibleMessages.map((msg) => (
                <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: mode === 'chat' && (msg as any).self ? 20 : -20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.5 } }}
                    layout
                    className={`flex ${mode === 'chat' ? 'flex-col mb-4' : 'items-start gap-3'} ${mode === 'chat' && (msg as any).self ? 'items-end' : 'items-start'}`}
                >
                    {mode === 'stream' && (
                        <div className={`text-xs font-bold ${msg.color} mt-1 shrink-0`}>{msg.user}</div>
                    )}

                    <div className={`
                        ${mode === 'chat'
                            ? ((msg as any).self ? 'bg-purple-600 text-white rounded-2xl rounded-tr-sm' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-2xl rounded-tl-sm')
                            : 'bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-sm text-neutral-900 dark:text-white/90 border border-black/5 dark:border-white/5'}
                        px-4 py-2 text-sm shadow-sm max-w-[85%]
                    `}>
                        {msg.text}
                    </div>
                    {mode === 'chat' && (
                        <span className="text-[10px] text-neutral-400 dark:text-white/30 px-1 mt-1">Disappearing...</span>
                    )}
                </motion.div>
            ))}
        </>
    );
}

function FlyingReactions() {
    const [reactions, setReactions] = useState<Array<{ id: number, type: 'heart' | 'gift', x: number }>>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const id = Date.now();
            // 70% chance of heart, 30% chance of gift
            const type = Math.random() > 0.7 ? 'gift' : 'heart';
            const x = Math.random() * 80 + 10; // 10% to 90%

            setReactions(prev => [...prev, { id, type: type as 'heart' | 'gift', x }]);

            setTimeout(() => {
                setReactions(prev => prev.filter(r => r.id !== id));
            }, 2500);

        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            <AnimatePresence>
                {reactions.map((reaction) => (
                    <motion.div
                        key={reaction.id}
                        initial={{ opacity: 0, y: 20, scale: 0.5 }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            y: -180,
                            scale: 1,
                            x: (Math.random() - 0.5) * 40 // Random wobble
                        }}
                        transition={{ duration: 2.5, ease: "easeOut" }}
                        className="absolute bottom-10"
                        style={{ left: `${reaction.x}%` }}
                    >
                        {reaction.type === 'heart' ? (
                            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                        ) : (
                            <div className="w-5 h-5">🎁</div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
