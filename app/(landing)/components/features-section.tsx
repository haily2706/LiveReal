"use client";

import { motion } from "framer-motion";
import {
    Timer,
    Gift,
    Wallet,
    Globe,
    Palette,
    Smartphone
} from "lucide-react";

const features = [
    {
        icon: Timer,
        title: "Event Countdown",
        description: "Automated countdown timer builds excitement before your stream goes live",
        color: "text-pink-600 dark:text-pink-400",
        gradient: "from-pink-500/20 to-rose-500/20",
    },
    {
        icon: Gift,
        title: "Virtual Gifts",
        description: "Receive beautiful animated gift effects from your audience during streams",
        color: "text-purple-600 dark:text-purple-400",
        gradient: "from-purple-500/20 to-violet-500/20",
    },
    {
        icon: Wallet,
        title: "Instant Cashout",
        description: "Convert your virtual gifts to real money and withdraw instantly",
        color: "text-yellow-600 dark:text-yellow-400",
        gradient: "from-yellow-500/20 to-orange-500/20",
    },
    {
        icon: Globe,
        title: "Global Reach",
        description: "Stream to audiences worldwide with low-latency live broadcasting",
        color: "text-cyan-600 dark:text-cyan-400",
        gradient: "from-cyan-500/20 to-blue-500/20",
    },
    {
        icon: Palette,
        title: "Custom Themes",
        description: "Choose from dozens of event-themed overlays, effects, and filters",
        color: "text-green-600 dark:text-green-400",
        gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
        icon: Smartphone,
        title: "Mobile Ready",
        description: "Stream from any device - phone, tablet, or desktop with full features",
        color: "text-blue-600 dark:text-blue-400",
        gradient: "from-blue-500/20 to-indigo-500/20",
    },
];

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 px-4 relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none" />

            <div className="container mx-auto max-w-6xl relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-4">
                        Powerful Features
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        Everything You Need to{" "}
                        <span className="bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                            Celebrate & Earn
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        Professional streaming tools designed specifically for event celebrations
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="group glass rounded-2xl p-6 h-full hover:scale-[1.02] transition-all duration-300 hover:border-pink-500/30 cursor-pointer">
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
