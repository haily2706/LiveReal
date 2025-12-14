"use client";

import Image from "next/image";
import Link from "next/link";
import { LiveStream, UpcomingEvent } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Signal, Bell, Crown, Award } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export type StreamType = 'live' | 'upcoming';

interface StreamCardProps {
    stream: LiveStream | UpcomingEvent;
    type: StreamType;
    index: number;
    rank?: number; // 1-based rank
    showRemindMe?: boolean;
    isVertical?: boolean;
}

export function StreamCard({ stream, type, index, rank, showRemindMe = false, isVertical: propIsVertical }: StreamCardProps) {
    const isVertical = propIsVertical ?? stream.isVertical;
    const scheduledFor = (stream as UpcomingEvent).scheduledFor;

    return (
        <motion.div
            className={`group relative flex flex-col gap-3 ${isVertical ? 'row-span-2' : 'col-span-1'}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
        >
            {/* Stream/Event Card */}
            <div className={`relative rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group-hover:-translate-y-1 ring-1 ring-white/10 w-full ${isVertical ? 'aspect-[9/16]' : 'aspect-video'}`}>
                <Link href={`/live/${stream.channel.username.replace('@', '')}`} className="absolute inset-0 block">
                    <Image
                        src={stream.thumbnail}
                        alt={stream.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Overlay */}
                    <div className={`absolute inset-0 transition-opacity duration-300 ${isVertical ? 'bg-linear-to-t from-black/90 via-black/20 to-black/20 opacity-100' : 'bg-linear-to-t from-black/60 via-transparent to-black/20 opacity-60 group-hover:opacity-40'}`} />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex gap-2 z-10">
                        {type === 'live' ? (
                            <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1.5 animate-pulse">
                                <Signal className="h-3 w-3" />
                                LIVE
                            </div>
                        ) : (
                            <div className="bg-blue-600/1 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1.5 shadow-lg">
                                <Calendar className="h-3 w-3" />
                                UPCOMING
                            </div>
                        )}
                    </div>

                    {/* Rank Badge */}
                    {rank !== undefined && (
                        <div className="absolute top-3 right-3 z-10">
                            {rank === 1 ? (
                                <div className="relative group/rank">
                                    <div className="absolute inset-0 bg-yellow-500 blur-md opacity-50 group-hover/rank:opacity-75 transition-opacity" />
                                    <div className="relative flex items-center gap-1.5 px-2.5 py-1 bg-linear-to-r from-yellow-400 via-orange-500 to-yellow-600 rounded-lg shadow-lg shadow-orange-500/20 border border-yellow-300/50">
                                        <Crown className="h-3.5 w-3.5 text-white fill-yellow-200" />
                                        <span className="text-sm font-black text-white tracking-tight drop-shadow-sm">#1</span>
                                    </div>
                                </div>
                            ) : rank === 2 ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-linear-to-r from-slate-300 via-gray-400 to-slate-500 rounded-lg shadow-lg border border-slate-300/50">
                                    <Award className="h-3.5 w-3.5 text-white fill-slate-200" />
                                    <span className="text-sm font-black text-white tracking-tight drop-shadow-sm">#2</span>
                                </div>
                            ) : rank === 3 ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-linear-to-r from-amber-700 via-orange-800 to-amber-900 rounded-lg shadow-lg border border-amber-600/50">
                                    <Award className="h-3.5 w-3.5 text-white fill-amber-500" />
                                    <span className="text-sm font-black text-white tracking-tight drop-shadow-sm">#3</span>
                                </div>
                            ) : rank === 4 ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-lg shadow-lg border border-indigo-400/50">
                                    <Award className="h-3.5 w-3.5 text-white fill-indigo-300" />
                                    <span className="text-sm font-black text-white tracking-tight drop-shadow-sm">#4</span>
                                </div>
                            ) : rank === 5 ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-linear-to-r from-rose-500 via-pink-500 to-rose-600 rounded-lg shadow-lg border border-rose-400/50">
                                    <Award className="h-3.5 w-3.5 text-white fill-rose-300" />
                                    <span className="text-sm font-black text-white tracking-tight drop-shadow-sm">#5</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center min-w-[28px] h-7 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg shadow-lg">
                                    <span className="text-xs font-bold text-white/90">#{rank}</span>
                                </div>
                            )}
                        </div>
                    )}


                    {/* Viewers / Date Badge (Position depends on layout) */}
                    {!isVertical && (
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-10">
                            {type === 'live' ? (
                                <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                    {stream.viewers.toLocaleString()} watching
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
                                    <Calendar className="h-3 w-3 text-blue-400" />
                                    {scheduledFor}
                                </div>
                            )}
                        </div>
                    )}

                    {isVertical && (
                        <div className="absolute top-3 right-3 flex justify-end items-start z-10">
                            {/* If rank is present, we adjust position or stack - for now let's assume vertical might overlap with rank if both present. 
                                Rank is top-right. Viewers/Date is also top-right in JFY.
                                Let's move headers to left if rank overrides? 
                                Actually JFY puts viewers top-right. Rank puts rank top-right. 
                                Let's put viewers below rank if both exist, or move viewers to bottom-right?
                                Simplified: If rank exists, we probably don't need viewers prominence there or we stack them.
                             */}
                            {!rank && (
                                <>
                                    {type === 'live' ? (
                                        <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                            {stream.viewers.toLocaleString()}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium bg-black/40 backdrop-blur-md px-2 py-1 rounded-full">
                                            <Calendar className="h-3 w-3 text-blue-400" />
                                            {scheduledFor}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Remind Me Button (Overlay Center) - Only for upcoming if requested */}
                    {showRemindMe && type === 'upcoming' && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                            {/* pointer-events-none to let click pass through to Link, but button needs pointer-events-auto */}
                            <div className="pointer-events-auto">
                                <Button size="sm" variant="secondary" className="font-semibold shadow-xl">
                                    <Bell className="h-4 w-4 mr-2" />
                                    Remind Me
                                </Button>
                            </div>
                        </div>
                    )}


                    {/* Vertical Layout Info (Overlaid) */}
                    {isVertical && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 pt-12 z-10 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-0.5 rounded-full shrink-0 ${type === 'live' ? 'bg-linear-to-tr from-orange-500 to-red-600' : 'bg-linear-to-tr from-blue-500 to-purple-600'}`}>
                                    <Avatar className="h-8 w-8 border-2 border-black/50">
                                        <AvatarImage src={stream.channel.avatar} />
                                        <AvatarFallback>{stream.channel.name[0]}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <p className="text-xs font-medium text-white/90 truncate">{stream.channel.name}</p>
                            </div>
                            <h3 className="font-semibold text-lg text-white line-clamp-2 leading-tight">
                                {stream.title}
                            </h3>
                        </div>
                    )}
                </Link>
            </div>

            {/* Horizontal Layout Info (Below) */}
            {!isVertical && (
                <div className="flex gap-3 px-1">
                    <Link href={`/channel/${stream.channel.username}`} className="shrink-0 relative">
                        <div className={`p-0.5 rounded-full ${type === 'live' ? 'bg-linear-to-tr from-orange-500 to-red-600' : 'bg-linear-to-tr from-blue-500 to-purple-600'}`}>
                            <Avatar className="h-9 w-9 border-2 border-background">
                                <AvatarImage src={stream.channel.avatar} />
                                <AvatarFallback>{stream.channel.name[0]}</AvatarFallback>
                            </Avatar>
                        </div>
                        {type === 'live' && (
                            <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full ring-2 ring-background bg-green-500" />
                        )}
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="font-semibold text-base line-clamp-1 leading-tight group-hover:text-primary transition-colors">
                            {stream.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Link href={`/channel/${stream.channel.username}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                {stream.channel.name}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
