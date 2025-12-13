"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Cake, ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTASection() {
    return (
        <section className="py-24 px-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-linear-to-r from-pink-500/10 via-purple-500/10 to-cyan-500/10" />

            {/* Floating emojis */}
            <motion.div
                className="absolute top-10 left-[10%] text-5xl opacity-60"
                animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                🎂
            </motion.div>
            <motion.div
                className="absolute bottom-10 right-[15%] text-5xl opacity-60"
                animate={{ y: [0, -20, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
                🎉
            </motion.div>
            <motion.div
                className="absolute top-1/2 left-[5%] text-4xl opacity-40"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
                🎁
            </motion.div>
            <motion.div
                className="absolute top-1/3 right-[8%] text-4xl opacity-40"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
                🎈
            </motion.div>

            <div className="container mx-auto max-w-4xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="glass rounded-3xl p-8 md:p-12 text-center"
                >
                    {/* Icon */}
                    <motion.div
                        animate={{ rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-pink-500 to-purple-500 mb-8"
                    >
                        <Cake className="w-10 h-10 text-white" />
                    </motion.div>

                    {/* Headline */}
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                        Ready to Make Your Birthday{" "}
                        <span className="bg-linear-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                            Unforgettable?
                        </span>
                    </h2>

                    <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Join thousands of creators who are turning their birthdays into amazing
                        live experiences. Start streaming for free today!
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="h-14 px-8 text-lg bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 animate-pulse-glow"
                            asChild
                        >
                            <Link href="/home">
                                Create Free Account
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>

                    {/* Trust line */}
                    <p className="text-sm text-muted-foreground mt-8">
                        ✨ No credit card required • Set up in 2 minutes • Free forever tier
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
