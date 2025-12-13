"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
    {
        name: "Sarah Chen",
        handle: "@sarahcreates",
        avatar: "🎤",
        earnings: "$2,500",
        quote: "My 21st birthday stream was incredible! I connected with fans from 15 countries and received so many heartfelt gifts. iReal made it unforgettable.",
        gradient: "from-pink-500/20 to-rose-500/20",
    },
    {
        name: "Marcus Johnson",
        handle: "@marcuslive",
        avatar: "🎸",
        earnings: "$4,200",
        quote: "I never thought I could monetize my birthday. iReal changed everything. The platform is so easy to use and the gift system is amazing!",
        gradient: "from-purple-500/20 to-violet-500/20",
    },
    {
        name: "Emily Rodriguez",
        handle: "@emilyvibes",
        avatar: "🎨",
        earnings: "$1,800",
        quote: "The countdown feature built so much hype. When I went live, I had 500 viewers waiting! Best birthday experience ever.",
        gradient: "from-cyan-500/20 to-blue-500/20",
    },
];

export function Testimonials() {
    return (
        <section id="testimonials" className="py-24 px-4 relative">
            <div className="container mx-auto max-w-6xl">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full glass text-sm font-medium text-pink-600 dark:text-pink-400 mb-4">
                        Success Stories
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                        Loved by{" "}
                        <span className="bg-linear-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                            Creators Worldwide
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        See how streamers are turning their birthdays into unforgettable experiences
                    </p>
                </motion.div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                        >
                            <div className="glass rounded-2xl p-6 h-full flex flex-col hover:scale-[1.02] transition-transform duration-300">
                                {/* Quote Icon */}
                                <Quote className="w-8 h-8 text-pink-600/30 dark:text-pink-400/30 mb-4" />

                                {/* Quote */}
                                <p className="text-muted-foreground flex-1 mb-6 leading-relaxed">
                                    "{testimonial.quote}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full bg-linear-to-br ${testimonial.gradient} flex items-center justify-center text-2xl`}>
                                            {testimonial.avatar}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{testimonial.name}</p>
                                            <p className="text-sm text-muted-foreground">{testimonial.handle}</p>
                                        </div>
                                    </div>

                                    {/* Earnings Badge */}
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Earned</p>
                                        <p className="font-bold text-green-600 dark:text-green-400">{testimonial.earnings}</p>
                                    </div>
                                </div>

                                {/* Stars */}
                                <div className="flex gap-1 mt-4 pt-4 border-t border-border/50">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400" />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
