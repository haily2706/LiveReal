"use client";

import { motion } from "framer-motion";
import { Calendar, Sparkles, Video, Wallet } from "lucide-react";

const steps = [
    {
        icon: Calendar,
        title: "Schedule Event",
        description: "Plan your event date and customize your stream with themes",
        color: "from-pink-500 to-rose-500",
        bgColor: "bg-pink-500/10",
        iconColor: "text-pink-600 dark:text-pink-500",
        delay: 0,
    },
    {
        icon: Video,
        title: "Go Live",
        description: "Broadcast to your audience worldwide with one tap",
        color: "from-purple-500 to-violet-500",
        bgColor: "bg-purple-500/10",
        iconColor: "text-purple-600 dark:text-purple-500",
        delay: 0.1,
    },
    {
        icon: Wallet,
        title: "Earn",
        description: "Receive virtual gifts that convert to real money instantly",
        color: "from-cyan-500 to-blue-500",
        bgColor: "bg-cyan-500/10",
        iconColor: "text-cyan-600 dark:text-cyan-500",
        delay: 0.2,
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 px-4 relative">
            {/* Background effect */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none" />
            <div className="container mx-auto max-w-6xl">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-purple-600 dark:text-purple-400 mb-4">
                        Simple Process
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        How It{" "}
                        <span className="bg-linear-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                            Works
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        Start streaming your birthday celebration in just three easy steps
                    </p>
                </motion.div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connection line - desktop only */}
                    <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-linear-to-r from-pink-500 via-purple-500 to-cyan-500 -translate-y-1/2 z-0" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: step.delay }}
                            className="relative z-10"
                        >
                            <div className="glass rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300">

                                {/* Step Number */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-linear-to-r from-pink-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                </div>

                                {/* Icon */}
                                <div className={`w-20 h-20 rounded-2xl ${step.bgColor} flex items-center justify-center mx-auto mb-6`}>
                                    <step.icon className={`w-10 h-10 ${step.iconColor}`} />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-muted-foreground">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
