"use client";

import { motion } from "framer-motion";
import { BackgroundBlobs } from "@/components/ui/background-blobs";
import { Button } from "@/components/ui/button";
import { Footer } from "@/app/(landing)/components/footer";
import Link from "next/link";
import {
    ArrowRight, Globe, Smartphone, TrendingUp, CheckCircle2, Rocket,
    Target, BarChart3, PieChart, Users, DollarSign, Zap
} from "lucide-react";

export default function InvestorPage() {
    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden bg-background font-sans">
            <BackgroundBlobs />

            <main className="flex-1 container mx-auto px-4 pt-32 pb-20">

                {/* Hero Section */}
                <section className="text-center max-w-5xl mx-auto mb-24 lg:mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 py-1 px-4 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-sm font-medium mb-8 border border-pink-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                            </span>
                            Series A Investment Opportunity
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-tight text-foreground">
                            Fueling the <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-b from-gray-900 to-gray-500 dark:from-white dark:to-white/50">Next Gen</span>{" "}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500">
                                Social Platform
                            </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                            We've validated the core with our MVP. Now, we're ready to scale globally and capture the mobile market.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link href="mailto:invest@ireal.com">
                                <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all">
                                    Contact for Investment
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full border-foreground/20 hover:bg-foreground/10 backdrop-blur-sm">
                                Download Pitch Deck
                            </Button>
                        </div>
                    </motion.div>
                </section>

                {/* Platform Showcase */}
                <section className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Available Everywhere</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Whether on desktop or on the go, iReal delivers a seamless, high-fidelity experience.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Web */}
                        <div className="group relative p-8 rounded-3xl bg-secondary/30 dark:bg-white/5 border border-border/50 dark:border-white/10 overflow-hidden hover:border-pink-500/30 transition-all duration-500 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-linear-to-b from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-500">
                                        <Globe className="h-6 w-6" />
                                    </div>
                                    <div className="text-2xl font-bold">Web Platform</div>
                                </div>
                                <p className="text-muted-foreground mb-8">Full-featured dashboard for power users, creators, and agency managers.</p>
                                <div className="mt-auto">
                                    <BrowserMockup />
                                </div>
                            </div>
                        </div>

                        {/* iOS */}
                        <div className="group relative p-8 rounded-3xl bg-secondary/30 dark:bg-white/5 border border-border/50 dark:border-white/10 overflow-hidden hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-linear-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                                        <Smartphone className="h-6 w-6" />
                                    </div>
                                    <div className="text-2xl font-bold">iOS App</div>
                                </div>
                                <p className="text-muted-foreground mb-8">Optimized for iPhone & iPad with ProMotion support and dynamic island integration.</p>
                                <div className="mt-auto flex justify-center">
                                    <PhoneMockup platform="ios" />
                                </div>
                            </div>
                        </div>

                        {/* Android */}
                        <div className="group relative p-8 rounded-3xl bg-secondary/30 dark:bg-white/5 border border-border/50 dark:border-white/10 overflow-hidden hover:border-green-500/30 transition-all duration-500 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-linear-to-b from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 rounded-2xl bg-green-500/10 text-green-500">
                                        <Smartphone className="h-6 w-6" />
                                    </div>
                                    <div className="text-2xl font-bold">Android App</div>
                                </div>
                                <p className="text-muted-foreground mb-8">Material You design language that adapts to your device's unique style.</p>
                                <div className="mt-auto flex justify-center">
                                    <PhoneMockup platform="android" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Market Opportunity */}
                <section className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Market Opportunity</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            The social connection economy is booming. iReal is positioned to capture a significant wedge of the high-value authentic interaction market.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <MarketCard
                            title="TAM"
                            subtitle="Total Addressable Market"
                            value="$48B"
                            detail="Global Social Discovery Market"
                            color="text-indigo-600 dark:text-indigo-400"
                            bg="bg-indigo-500/10"
                            border="border-indigo-500/20"
                        />
                        <MarketCard
                            title="SAM"
                            subtitle="Serviceable Available Market"
                            value="$12B"
                            detail="Mobile-First Gen Z Demographics"
                            color="text-pink-600 dark:text-pink-400"
                            bg="bg-pink-500/10"
                            border="border-pink-500/20"
                        />
                        <MarketCard
                            title="SOM"
                            subtitle="Serviceable Obtainable Market"
                            value="$250M"
                            detail="Year 3 Targeted Revenue"
                            color="text-emerald-600 dark:text-emerald-400"
                            bg="bg-emerald-500/10"
                            border="border-emerald-500/20"
                        />
                    </div>
                </section>

                {/* Revenue Model */}
                <section className="mb-32">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Monetization</h2>
                            <p className="text-xl text-muted-foreground mb-8">
                                A diverse, resilient revenue model designed for sustainability and high ARPU (Average Revenue Per User).
                            </p>

                            <div className="space-y-6">
                                <RevenueItem
                                    icon={<Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />}
                                    title="Premium Subscriptions"
                                    desc="Recurring revenue from power users unlocking exclusive features and visibility boosts."
                                />
                                <RevenueItem
                                    icon={<DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />}
                                    title="Virtual Goods & Gifting"
                                    desc="Micro-transactions for digital assets and creator support, driving high-margin revenue."
                                />
                                <RevenueItem
                                    icon={<Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
                                    title="Targeted Advertising"
                                    desc="Native, non-intrusive ad placements for brands looking to reach verified authentic users."
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-linear-to-r from-pink-500 to-purple-500 blur-3xl opacity-20" />
                            <div className="relative p-1 rounded-3xl bg-linear-to-b from-foreground/20 to-foreground/5">
                                <div className="bg-background/80 dark:bg-black/80 backdrop-blur-xl rounded-[22px] p-8 overflow-hidden border border-border/50">
                                    {/* Abstract representation of revenue growth */}
                                    <div className="flex items-end gap-4 h-64 w-full">
                                        <div className="w-1/4 bg-gray-400/50 dark:bg-gray-700/50 rounded-t-lg h-[30%] animate-pulse" style={{ animationDelay: "0s" }}></div>
                                        <div className="w-1/4 bg-gray-300/50 dark:bg-gray-600/50 rounded-t-lg h-[50%] animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                                        <div className="w-1/4 bg-gray-200/50 dark:bg-gray-500/50 rounded-t-lg h-[70%] animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                                        <div className="w-1/4 bg-linear-to-t from-pink-500 to-purple-500 rounded-t-lg h-[90%] shadow-[0_0_20px_rgba(236,72,153,0.5)]"></div>
                                    </div>
                                    <p className="text-center mt-6 font-mono text-sm text-muted-foreground">Projected Revenue Growth (Y1-Y4)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Roadmap */}
                <section className="mb-40">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Phase 2 Roadmap</h2>
                        <p className="text-xl text-muted-foreground">Execution plan for the next 12 months post-funding.</p>
                    </div>

                    <div className="relative max-w-4xl mx-auto">
                        {/* Vertical Line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-linear-to-b from-pink-500 via-purple-500 to-transparent opacity-50 hidden md:block" />

                        <div className="space-y-12 md:space-y-24">
                            <RoadmapItem
                                quarter="Q1"
                                year="2026"
                                title="Scale API"
                                items={["Infrastructure Scaling", "Latency Reduction", "Core API Optimization"]}
                                align="left"
                            />
                            <RoadmapItem
                                quarter="Q2"
                                year="2026"
                                title="Global Infrastructure"
                                items={["Edge Network Deployment", "Multi-region DB Sharding", "On-Premises Streaming"]}
                                align="right"
                            />
                            <RoadmapItem
                                quarter="Q3"
                                year="2026"
                                title="Growth Engine"
                                items={["Launch Creator Fund", "Influencer Marketing Push", "Referral Program 2.0"]}
                                align="left"
                            />
                            <RoadmapItem
                                quarter="Q4"
                                year="2026"
                                title="Ecosystem Expansion"
                                items={["Public API for Developers", "Hardware Partnerships", "Series B Preparation"]}
                                align="right"
                            />
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="relative rounded-[3rem] overflow-hidden bg-secondary/30 dark:bg-white/5 border border-border/50 dark:border-white/10 p-12 md:p-24 text-center">
                    <div className="absolute inset-0 bg-linear-to-r from-pink-500/20 to-purple-600/20 blur-3xl -z-10" />

                    <h2 className="text-4xl md:text-6xl font-bold mb-8">Join the Revolution</h2>
                    <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                        We are building the future of digital connection. The train is leaving the station.
                    </p>
                    <Link href="mailto:invest@ireal.com">
                        <Button size="lg" className="h-16 px-12 text-xl rounded-full bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-xl shadow-pink-500/25 scale-100 hover:scale-105 transition-all duration-300">
                            Inquire About Investment
                        </Button>
                    </Link>
                </section>

            </main>

            <Footer />
        </div>
    );
}

function BrowserMockup() {
    return (
        <div className="w-full aspect-video bg-background rounded-lg border border-border overflow-hidden shadow-2xl relative select-none">
            <div className="h-6 bg-secondary/50 border-b border-border flex items-center gap-1.5 px-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
            <div className="p-4 relative w-full h-full group-hover:scale-[1.02] transition-transform duration-500 origin-top">
                <div className="absolute inset-0 bg-linear-to-br from-pink-500/5 via-purple-500/5 to-indigo-500/5" />
                <div className="flex gap-4 h-full">
                    <div className="w-1/4 h-3/4 bg-foreground/5 rounded-md mt-2 ml-2 backdrop-blur-sm" />
                    <div className="flex-1 h-full bg-foreground/5 rounded-t-lg mt-2 mr-2 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-t from-background/20 to-transparent" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function PhoneMockup({ platform }: { platform: 'ios' | 'android' }) {
    return (
        <div className="w-[180px] aspect-[9/19] bg-background border-[6px] border-foreground/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative select-none group-hover:scale-[1.02] transition-transform duration-500">
            {platform === 'ios' && (
                <div className="absolute top-0 inset-x-0 h-5 bg-foreground/10 mx-auto w-1/2 rounded-b-xl z-20" />
            )}
            {platform === 'android' && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground/10 rounded-full z-20" />
            )}

            <div className="absolute inset-0 bg-secondary/20" />
            <div className="absolute inset-0 bg-linear-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10" />

            <div className="relative p-3 pt-8 h-full flex flex-col gap-3">
                <div className="w-full aspect-square rounded-xl bg-foreground/5 backdrop-blur-sm" />
                <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-foreground/5" />
                    <div className="flex-1 space-y-1 py-1">
                        <div className="w-full h-2 rounded-full bg-foreground/5" />
                        <div className="w-2/3 h-2 rounded-full bg-foreground/5" />
                    </div>
                </div>
                <div className="flex-1 rounded-xl bg-foreground/5 backdrop-blur-sm mt-2" />
            </div>
        </div>
    )
}

function MarketCard({ title, subtitle, value, detail, color, bg, border }: any) {
    return (
        <div className={`p-8 rounded-3xl border ${border} ${bg} backdrop-blur-xs flex flex-col items-center text-center hover:scale-105 transition-transform duration-300`}>
            <div className={`text-6xl font-black mb-4 ${color}`}>{title}</div>
            <div className="text-lg font-bold mb-2 text-foreground">{subtitle}</div>
            <div className="text-4xl font-bold text-foreground mb-2">{value}</div>
            <p className="text-sm text-muted-foreground">{detail}</p>
        </div>
    )
}

function RevenueItem({ icon, title, desc }: any) {
    return (
        <div className="flex gap-6 p-6 rounded-2xl bg-secondary/30 dark:bg-white/5 border border-border/50 dark:border-white/5 hover:bg-secondary/50 dark:hover:bg-white/10 transition-colors">
            <div className="mt-1 p-3 bg-background dark:bg-white/10 rounded-xl h-fit w-fit shadow-sm dark:shadow-none">{icon}</div>
            <div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

function RoadmapItem({ quarter, year, title, items, align }: any) {
    const isRight = align === "right";

    return (
        <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${isRight ? 'md:flex-row-reverse' : ''}`}>
            {/* Date */}
            <div className={`flex-1 text-center md:text-${isRight ? 'left' : 'right'}`}>
                <div className="text-5xl font-black text-foreground/10">{quarter}</div>
                <div className="text-xl font-bold text-pink-600 dark:text-pink-500">{year}</div>
            </div>

            {/* Node */}
            <div className="relative hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.5)] z-10 shrink-0">
                <div className="w-3 h-3 bg-background dark:bg-white rounded-full" />
            </div>

            {/* Content */}
            <div className="flex-1 w-full md:w-auto">
                <div className="p-8 rounded-2xl bg-secondary/30 dark:bg-white/5 border border-border/50 dark:border-white/10 hover:border-pink-500/30 transition-colors">
                    <h3 className="text-2xl font-bold mb-4 text-foreground">{title}</h3>
                    <ul className="space-y-3">
                        {items.map((item: string, i: number) => (
                            <li key={i} className="flex items-center gap-3 text-muted-foreground">
                                <CheckCircle2 className="h-5 w-5 text-pink-500/50" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}
