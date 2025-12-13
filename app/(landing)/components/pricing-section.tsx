"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown } from "lucide-react";

const tiers = [
    {
        name: "Free",
        icon: Sparkles,
        price: "$0",
        period: "forever",
        description: "Perfect for getting started",
        platformFee: "20%",
        features: [
            "Up to 100 viewers per stream",
            "Basic birthday themes",
            "Standard gift animations",
            "24-hour stream scheduling",
            "Community support",
        ],
        cta: "Get Started Free",
        popular: false,
        gradient: "from-gray-500 to-slate-500",
        buttonVariant: "outline" as const,
    },
    {
        name: "Pro",
        icon: Zap,
        price: "$2.99",
        period: "/month",
        description: "For serious streamers",
        platformFee: "10%",
        features: [
            "Unlimited viewers",
            "Premium birthday themes",
            "Custom gift animations",
            "Schedule streams 30 days ahead",
            "Priority support",
            "Analytics dashboard",
            "Custom overlays",
        ],
        cta: "Start Pro Trial",
        popular: true,
        gradient: "from-pink-500 to-purple-500",
        buttonVariant: "default" as const,
    },
    {
        name: "Creator",
        icon: Crown,
        price: "$9.99",
        period: "/month",
        description: "Maximum earnings potential",
        platformFee: "5%",
        features: [
            "Everything in Pro",
            "Lowest platform fees (5%)",
            "Custom branding removal",
            "API access",
            "Dedicated account manager",
            "Early access to features",
            "Revenue analytics",
            "Multi-stream support",
        ],
        cta: "Go Creator",
        popular: false,
        gradient: "from-yellow-500 to-orange-500",
        buttonVariant: "outline" as const,
    },
];

export function PricingSection() {
    return (
        <section id="pricing" className="py-24 px-4 relative">
            {/* Background */}
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
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-green-600 dark:text-green-400 mb-4">
                        Simple Pricing
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        Choose Your{" "}
                        <span className="bg-linear-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                            Streaming Plan
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        Start free and upgrade as you grow. Lower fees mean more earnings for you.
                    </p>
                </motion.div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={tier.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            className={`relative ${tier.popular ? 'md:-mt-4 md:mb-4' : ''}`}
                        >
                            {/* Popular Badge */}
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                                    <span className="px-4 py-1 rounded-full bg-linear-to-r from-pink-500 to-purple-500 text-sm font-semibold">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className={`glass rounded-2xl p-8 h-full flex flex-col ${tier.popular ? 'border-pink-500/50 ring-1 ring-pink-500/20' : ''}`}>
                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${tier.gradient} flex items-center justify-center`}>
                                        <tier.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold">{tier.name}</h3>
                                </div>

                                {/* Price */}
                                <div className="mb-4">
                                    <span className="text-4xl font-bold">{tier.price}</span>
                                    <span className="text-muted-foreground">{tier.period}</span>
                                </div>

                                <p className="text-muted-foreground text-sm mb-6">
                                    {tier.description}
                                </p>

                                {/* Platform Fee */}
                                <div className="mb-6 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <p className="text-sm">
                                        <span className="text-muted-foreground">Platform fee:</span>{" "}
                                        <span className="font-bold text-green-600 dark:text-green-400">{tier.platformFee}</span>
                                    </p>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 flex-1 mb-8">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                                            <span className="text-sm text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <Button
                                    className={`w-full h-12 ${tier.popular ? 'bg-linear-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600' : ''}`}
                                    variant={tier.buttonVariant}
                                >
                                    {tier.cta}
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Money Back Guarantee */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center text-sm text-muted-foreground mt-10"
                >
                    🔒 14-day money-back guarantee • Cancel anytime • No hidden fees
                </motion.p>
            </div>
        </section>
    );
}
