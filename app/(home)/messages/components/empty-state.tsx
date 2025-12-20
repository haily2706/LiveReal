"use client";

import { motion } from "framer-motion";
import { MessageSquare, Shield, Zap } from "lucide-react";

export function EmptyChatState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center bg-background/50 backdrop-blur-3xl overflow-hidden relative">
            {/* Background animated elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
            >
                <div className="relative mb-8 mx-auto w-32 h-32">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="absolute inset-0 bg-linear-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl rotate-6 backdrop-blur-sm border border-white/5"
                    />
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        className="absolute inset-0 bg-background rounded-3xl shadow-2xl flex items-center justify-center border border-border/50 -rotate-3"
                    >
                        <div className="relative">
                            <MessageSquare className="w-12 h-12 text-primary" strokeWidth={1.5} />
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.8, type: "spring" }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
                            />
                        </div>
                    </motion.div>
                </div>

                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 mb-4"
                >
                    LiveReal Messages
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-muted-foreground max-w-md mx-auto text-base leading-relaxed mb-8"
                >
                    Connect deeply with your community. Select a conversation from the sidebar to start chatting.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-2 gap-4 max-w-xs mx-auto"
                >
                    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                        <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-500">
                            <Shield className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">End-to-End Encrypted</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                        <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
                            <Zap className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">Instant Delivery</span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
