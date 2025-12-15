"use client";

import { motion } from "framer-motion";
import { Wallet, Coins, ArrowRightLeft, CreditCard, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const CoinIcon = ({ className }: { className?: string }) => (
    <div className={`relative ${className}`}>
        <Image
            src="/coin.svg"
            alt="LiveReal Coin"
            fill
            className="object-contain"
        />
    </div>
);

const features = [
    {
        icon: Wallet,
        title: "Personal Wallet",
        description: "Every user gets a secure, dedicated wallet to manage assets effortlessly.",
        color: "text-brand-gold",
        gradient: "from-brand-gold/20 to-yellow-500/20",
    },
    {
        icon: CoinIcon,
        title: "LiveReal Coin Integration",
        description: "Hold and transact with LiveReal coin, the native currency of our ecosystem.",
        color: "text-brand-blue",
        gradient: "from-brand-blue/20 to-cyan-500/20",
    },
    {
        icon: ArrowRightLeft,
        title: "Seamless Transfer",
        description: "Transfer gifts directly on the network with lightning-fast finality.",
        color: "text-purple-600 dark:text-purple-400",
        gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
        icon: CreditCard,
        title: "Easy Cash In & Out",
        description: "Instantly convert your received virtual gifts into real world value.",
        color: "text-green-600 dark:text-green-400",
        gradient: "from-green-500/20 to-emerald-500/20",
    },
];

export function HBarWalletSection() {
    return (
        <section id="hbar-wallet" className="py-24 px-4 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-blue-900/5 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-brand-blue mb-4 border border-brand-blue/20">
                            Powered by Hedera Hashgraph
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Unlock the Power of <br />
                            <span className="bg-linear-to-r from-brand-blue via-purple-500 to-brand-gold bg-clip-text text-transparent">
                                Web3 Finance
                            </span>
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                            Experience true ownership with your personal wallet.
                            Receive gifts, hold LiveReal coins.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="bg-linear-to-r from-brand-blue to-purple-600 hover:opacity-90 transition-opacity">
                                Create Wallet
                            </Button>
                            <Button size="lg" variant="outline" className="border-brand-blue/30 hover:bg-brand-blue/10">
                                Learn More
                            </Button>
                        </div>

                        <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <span>Bank-grade Security</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                <span>Instant Settlement</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Feature Grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group"
                            >
                                <div className="glass p-6 rounded-2xl h-full hover:border-brand-blue/30 transition-all duration-300 hover:translate-y-[-5px]">
                                    <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className={`w-6 h-6 ${feature.color}`} />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
