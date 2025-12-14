"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
    Settings,

    LogOut,
    LogIn,
    Menu,
    Wallet,
    Calendar,
    Compass,
    Clapperboard,
    MessageCircle,
    Zap,
    Sparkles,
    Crown
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/app/components/auth/use-auth-store";
import { useAuthModal } from "@/app/components/auth/use-auth-modal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/app/(home)/components/provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Coin } from "@/components/ui/coin";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isCollapsed, toggleSidebar, showPremiumBalance } = useSidebar();
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);
    const subscription = "Creator" as "Free" | "Pro" | "Creator"; // Mock Data

    const supabase = createClient();
    const { user, setUser } = useAuthStore();
    const { onOpen } = useAuthModal();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            if (event === 'SIGNED_OUT') {
                router.refresh();
            }
        });

        // Initial fetch to ensure sync
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, router, supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <aside
            className={cn(
                "sticky top-0 left-0 h-screen flex-col border-r border-border/50 hidden md:flex transition-all duration-500 cubic-bezier(0.25, 1, 0.5, 1) z-40",
                "bg-background/80 dark:bg-background/20 backdrop-blur-xl supports-backdrop-filter:bg-background/80",
                "shadow-[5px_0_30px_0_rgba(0,0,0,0.1)] dark:shadow-[5px_0_30px_0_rgba(0,0,0,0.3)]",
                isCollapsed ? "w-[90px]" : "w-[240px]"
            )}
        >
            {/* Ambient Background Gradient */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-r-3xl">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[30%] bg-purple-500/5 dark:bg-purple-500/10 blur-[80px] rounded-full" />
                <div className="absolute top-[40%] -right-[20%] w-[60%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 blur-[80px] rounded-full" />
                <div className="absolute -bottom-[10%] left-[10%] w-[40%] h-[30%] bg-pink-500/5 dark:bg-pink-500/10 blur-[80px] rounded-full" />
            </div>

            <div className={cn("h-12 mb-4 flex items-center relative z-20", isCollapsed ? "justify-center" : "justify-between px-2")}>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full shrink-0 transition-all duration-300 hover:rotate-180"
                    onClick={toggleSidebar}
                >
                    <Menu className="h-6 w-6" />
                </Button>
                {/* <Badge
                    variant="outline"
                    className={cn(
                        "border-0 uppercase text-[10px] h-5 px-1.5 font-bold tracking-wider gap-1",
                        subscription === "Free" && "bg-muted text-muted-foreground",
                        subscription === "Pro" && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
                        subscription === "Creator" && "bg-linear-to-r from-[#FF3B5C] to-[#EF233C] text-white shadow-[0_2px_10px_rgba(255,59,92,0.3)]"
                    )}
                >
                    {subscription === "Free" && <Sparkles className="w-3 h-3" />}
                    {subscription === "Pro" && <Zap className="w-3 h-3 fill-current" />}
                    {subscription === "Creator" && <Crown className="w-3 h-3 fill-current" />}
                    {subscription}
                </Badge> */}
            </div>

            <div className="flex flex-col flex-1 h-full overflow-y-auto custom-scrollbar relative z-10 px-2 space-y-2 pb-4 gap-4">
                {/* Profile Section */}
                <div className={cn("flex flex-col items-center transition-all duration-300", isCollapsed ? "px-0" : "px-2")}>
                    {user ? (
                        <>
                            <div className="relative group cursor-pointer" onClick={() => router.push("/settings")}>
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 2 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    className={cn(
                                        "rounded-full p-[3px] bg-linear-to-tr from-[#FF3B5C] via-purple-500 to-blue-500 shadow-xl shadow-purple-500/20 dark:shadow-purple-500/30",
                                        isCollapsed ? "h-[50px] w-[50px]" : "h-[90px] w-[90px]"
                                    )}
                                >
                                    <div className="h-full w-full rounded-full border-[3px] border-background overflow-hidden bg-background">
                                        <Avatar className="h-full w-full">
                                            <AvatarImage src={user.user_metadata?.avatar_url || "https://github.com/shadcn.png"} alt={user.user_metadata?.full_name || "User"} className="object-cover" />
                                            <AvatarFallback>{(user.email?.[0] || "U").toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </motion.div>

                                {/* Status Indicator with Pulse */}
                                <div className="absolute bottom-1 right-1">
                                    <span className="relative flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-background"></span>
                                    </span>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {!isCollapsed && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                        animate={{ opacity: 1, height: "auto", y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className="mt-5 text-center w-full cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => router.push("/settings")}
                                    >
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <h2 className="font-bold text-xl text-foreground tracking-tight drop-shadow-sm truncate max-w-[180px]">
                                                {user.user_metadata?.full_name || user.email?.split('@')[0] || "User"}
                                            </h2>
                                        </div>
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-muted/50 border border-border backdrop-blur-sm max-w-full">
                                            <span className="text-xs font-medium text-muted-foreground truncate max-w-[150px]">
                                                {user.user_metadata?.handle ?? ''}
                                            </span>
                                        </div>

                                        {/* Premium Balance Card */}
                                        {showPremiumBalance && (
                                            <div
                                                onClick={() => router.push("/settings/wallet")}
                                                className="mt-6 p-4 rounded-2xl bg-linear-to-b from-muted/50 to-transparent border border-border backdrop-blur-md relative overflow-hidden group cursor-pointer hover:border-purple-500/50 transition-all duration-300"
                                            >
                                                {/* Background Coin */}
                                                <div className="absolute -right-5 -bottom-5 opacity-[0.05] group-hover:opacity-15 transition-all duration-500 rotate-[15deg] group-hover:rotate-0 scale-100 group-hover:scale-110 pointer-events-none">
                                                    <Coin className="w-28 h-28 blur-[1px]" />
                                                </div>

                                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-foreground/5 to-transparent -translate-x-full group-hover:animate-shimmer" />

                                                <div className="flex items-center justify-between mb-2 relative z-10">
                                                    <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                                                        <div className="p-1 rounded-md bg-muted/50">
                                                            <Wallet className="w-3 h-3 text-yellow-600 dark:text-yellow-500" />
                                                        </div>
                                                        Balance
                                                    </div>
                                                </div>

                                                <div className="text-xl font-bold text-foreground tracking-tighter text-left flex items-center gap-1 relative z-10">
                                                    98,890
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : null}
                </div>

                {/* Main Links */}
                <div className="flex-1 space-y-2">
                    {!isCollapsed && (
                        <h3 className="px-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 pl-4">Discover</h3>
                    )}
                    <div className="space-y-2" onMouseLeave={() => setHoveredLink(null)}>
                        {[
                            { icon: Compass, label: "Explore", href: "/home", color: "text-blue-400" },
                            // { icon: Clapperboard, label: "Shorts", href: "/shorts", color: "text-red-400" },
                            { icon: MessageCircle, label: "Messages", href: "/messages", color: "text-green-400" },
                            { icon: Calendar, label: "Schedules", href: "/schedules", color: "text-purple-400" },
                            { icon: Settings, label: "Settings", href: "/settings", color: "text-gray-400" }
                        ].map((link) => (
                            <SidebarLink
                                key={link.href}
                                link={link}
                                pathname={pathname}
                                isCollapsed={isCollapsed}
                                isHovered={hoveredLink === link.href}
                                onHover={() => setHoveredLink(link.href)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className={cn("mt-auto p-4 flex items-center border-t border-border/50 bg-background/60 dark:bg-background/20 backdrop-blur-md relative z-20", isCollapsed ? "justify-center flex-col gap-4" : "justify-between")}>

                {user ? (
                    <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                        <LogOut className="h-5 w-5" />
                    </Button>
                ) : (
                    <Button variant="ghost" size="icon" onClick={() => onOpen("sign_in")} className="text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all">
                        <LogIn className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </aside>
    );
}

function SidebarLink({
    link,
    pathname,
    isCollapsed,
    isHovered,
    onHover
}: {
    link: any,
    pathname: string,
    isCollapsed: boolean,
    isHovered: boolean,
    onHover: () => void
}) {
    const active = isActive(pathname, link.href);

    return (
        <Link
            href={link.href}
            className="block"
            onMouseEnter={onHover}
        >
            <div
                className={cn(
                    "relative flex items-center transition-all duration-300 group px-3 py-3 rounded-2xl mx-2 overflow-hidden",
                    isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "w-auto",
                    active && "bg-linear-to-r from-[#FF3B5C]/10 via-purple-500/5 to-transparent"
                )}
            >

                {/* Active Indicator Bar */}
                {active && (
                    <motion.div
                        layoutId="active-indicator"
                        className="absolute left-0 w-[3px] h-6 bg-[#FF3B5C] rounded-r-full shadow-[0_0_10px_#FF3B5C]"
                        initial={{ opacity: 0, scaleY: 0.5 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ duration: 0.2 }}
                    />
                )}

                {/* Hover Spotlight for non-active items */}
                {!active && isHovered && (
                    <motion.div
                        layoutId="hover-nav-bg"
                        className="absolute inset-0 bg-muted/50 rounded-2xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}


                <div className={cn(
                    "relative z-10 flex items-center transition-all duration-300",
                    isCollapsed ? "justify-center" : "gap-4",
                    active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}>
                    <link.icon className={cn(
                        "h-[22px] w-[22px] transition-all duration-300",
                        active ? "text-[#FF3B5C] drop-shadow-[0_0_8px_rgba(255,59,92,0.5)]" : "",
                        !active && isHovered ? link.color : "",
                        isCollapsed ? "" : "",
                        "group-hover:scale-110"
                    )} />

                    {!isCollapsed && (
                        <span className={cn(
                            "text-sm font-medium tracking-wide transition-all duration-300",
                            active ? "font-bold" : ""
                        )}>
                            {link.label}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

function isActive(pathname: string, href: string) {
    return pathname === href || pathname?.startsWith(`${href}/`);
}


