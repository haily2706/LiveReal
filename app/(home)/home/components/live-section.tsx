"use client";

import Image from "next/image";
import Link from "next/link";
import { LiveStream } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Users, Play } from "lucide-react";
import { motion } from "framer-motion";

interface LiveSectionProps {
    lives: LiveStream[];
    title?: string;
}

export function LiveSection({ lives, title = "Birthday Live" }: LiveSectionProps) {
    if (lives.length === 0) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
                    <p className="text-sm text-muted-foreground">Catch the latest streaming events</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {lives.slice(0, 4).map((live, index) => (
                    <motion.div
                        key={live.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative flex flex-col gap-3"
                    >
                        {/* Thumbnail Container */}
                        {/* Thumbnail Container */}
                        <Link href={`/live/${live.channel.username.replace('@', '')}`} className="block relative aspect-video rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 ring-offset-background group-hover:ring-2 ring-primary/50">
                            <Image
                                src={live.thumbnail}
                                alt={live.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/0 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center ring-1 ring-white/50 shadow-2xl transform hover:scale-110 transition-transform">
                                    <Play className="h-7 w-7 text-white fill-white ml-1" />
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="absolute top-2 left-2 flex gap-2">
                                <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center shadow-lg">
                                    LIVE
                                </div>
                                <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-sm flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {live.viewers}
                                </div>
                            </div>
                        </Link>

                        {/* Info Section */}
                        <div className="flex gap-3 px-1">
                            <Link href={`/channel/${live.channel.username}`} className="shrink-0">
                                <div className="p-0.5 rounded-full bg-linear-to-tr from-yellow-400 to-purple-600">
                                    <Avatar className="h-9 w-9 border-2 border-background">
                                        <AvatarImage src={live.channel.avatar} />
                                        <AvatarFallback>{live.channel.name[0]}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </Link>

                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h3 className="font-semibold text-base line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                                    {live.title}
                                </h3>
                                <Link href={`/channel/${live.channel.username}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-0.5 flex items-center gap-1">
                                    {live.channel.name}
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
