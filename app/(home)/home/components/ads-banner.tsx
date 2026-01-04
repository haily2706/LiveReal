"use client";

import { Button } from "@/components/ui/button";
import { Coin } from "@/components/ui/coin";
import { ArrowRight, Sparkles } from "lucide-react";

export function AdsBanner() {
    return (
        <div className="relative w-full rounded-xl overflow-hidden bg-linear-to-r from-violet-600 to-indigo-600 shadow-lg mb-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-overlay blur-3xl translate-x-1/3 translate-y-1/3" />
            </div>
            <div className="absolute -right-5 -top-5 opacity-[0.1] group-hover:opacity-15 transition-all duration-500 rotate-15 group-hover:rotate-0 scale-100 group-hover:scale-110 pointer-events-none">
                <Coin className="w-24 h-24 blur-[1px]" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-4 md:p-6 gap-4">
                <div className="space-y-2 max-w-xl text-center md:text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-medium backdrop-blur-sm border border-white/20">
                        <Sparkles className="h-3 w-3" />
                        <span>Premium Offer</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                        Unlock Exclusive Content with Premium Pass
                    </h2>
                    <p className="text-indigo-100 text-sm">
                        Get ad-free streaming, exclusive badges, and special access to creator events.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 pt-1 justify-center md:justify-start">
                        <Button size="sm" className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-full shadow-md hover:shadow-lg transition-all h-9 px-4">
                            Get Premium
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent border-white/30 text-white hover:bg-white/20 hover:text-white rounded-full h-9 px-4 hover:border-white/50"
                        >
                            Learn More
                        </Button>
                    </div>
                </div>

                {/* Decorative Visual */}
                <div className="hidden md:block relative w-32 h-32 shrink-0">
                    {/* Floating Cards Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-16 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-xl rotate-[-10deg] animate-pulse" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-16 bg-linear-to-br from-pink-500 to-rose-500 rounded-lg shadow-xl rotate-[5deg]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-4">
                        <Sparkles className="h-8 w-8 text-white drop-shadow-md" />
                    </div>
                </div>
            </div>
        </div>
    );
}
