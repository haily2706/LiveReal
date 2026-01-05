"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
    Settings,
    User,

    LogOut,
    LogIn,
    Menu,

    Calendar,
    Compass,
    Clapperboard,
    MessageCircle,
    Zap,
    Sparkles,
    Crown
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/components/auth/use-auth-store";
import { useAuthModal } from "@/components/auth/use-auth-modal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/app/(home)/components/provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PremiumBalanceCard } from "@/app/(home)/settings/wallet/components/premium-balance-card";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isCollapsed, toggleSidebar, showPremiumBalance } = useSidebar();
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);
    const subscription = "Creator" as "Free" | "Pro" | "Creator"; // Mock Data

    const supabase = createClient();
    const { user, setUser, isLoading } = useAuthStore();
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
                "sticky top-0 left-0 h-screen flex-col border-r border-border/50 hidden md:flex z-40",
                "transition-all duration-500 cubic-bezier(0.25, 1, 0.5, 1)",
                "bg-background/80 dark:bg-background/20 backdrop-blur-xl supports-backdrop-filter:bg-background/80",
                "shadow-[5px_0_30px_0_rgba(0,0,0,0.1)] dark:shadow-[5px_0_30px_0_rgba(0,0,0,0.3)]",
                isCollapsed ? "w-[70px]" : "w-[240px]"
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

            <div className="flex flex-col flex-1 h-full overflow-y-auto custom-scrollbar relative z-10 px-2 space-y-1 pb-4 gap-4">
                {/* Profile Section */}
                <div className={cn("flex flex-col items-center transition-all duration-300", isCollapsed ? "px-0" : "px-2")}>
                    {isLoading ? (
                        <>
                            <div className={cn(
                                "rounded-full bg-muted animate-pulse",
                                isCollapsed ? "h-[50px] w-[50px]" : "h-[90px] w-[90px]"
                            )} />
                            {!isCollapsed && (
                                <div className="mt-5 w-full flex flex-col items-center gap-2">
                                    <div className="h-6 w-32 bg-muted animate-pulse rounded-md" />
                                    <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />

                                    {showPremiumBalance && (
                                        <div className="mt-6 w-full h-24 bg-muted animate-pulse rounded-2xl" />
                                    )}
                                </div>
                            )}
                        </>
                    ) : user ? (
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
                                        {/* Premium Balance Card */}
                                        {showPremiumBalance && (
                                            <PremiumBalanceCard />
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
                        <h3 className="px-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 pl-4">
                            Discover
                        </h3>
                    )}
                    <div
                        className="space-y-2"
                        onMouseLeave={() => setHoveredLink(null)}
                    >
                        {NAV_LINKS.map((link) => (
                            <div key={link.href}>
                                <SidebarLink
                                    link={link}
                                    pathname={pathname}
                                    isCollapsed={isCollapsed}
                                    isHovered={hoveredLink === link.href}
                                    onHover={() => setHoveredLink(link.href)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className={cn("mt-auto p-4 flex items-center border-t border-border/50 bg-background/60 dark:bg-background/20 backdrop-blur-md relative z-20", isCollapsed ? "justify-center flex-col gap-4" : "justify-between")}>

                {isLoading ? (
                    <div className="h-9 w-9 rounded-xl bg-muted animate-pulse" />
                ) : user ? (
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
                    "relative flex items-center transition-all duration-200 group px-3 py-2 rounded-lg mx-2",
                    isCollapsed ? "justify-center px-0 w-10 h-10 mx-auto" : "w-auto",
                    active && "bg-muted font-medium text-foreground",
                    !active && "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
            >
                <link.icon className={cn(
                    "h-5 w-5 transition-all duration-200",
                    active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                    isCollapsed ? "" : "mr-3"
                )} />

                {!isCollapsed && (
                    <span className="text-sm truncate">
                        {link.label}
                    </span>
                )}
            </div>
        </Link>
    );
}


function isActive(pathname: string, href: string) {
    return pathname === href || pathname?.startsWith(`${href}/`);
}

const NAV_LINKS = [
    { icon: Compass, label: "Explore", href: "/home", color: "text-blue-400" },
    { icon: Calendar, label: "Events", href: "/events/list", color: "text-purple-400" },
    { icon: Settings, label: "Settings", href: "/settings/wallet", color: "text-gray-400" }
];

export function MobileBottomNav() {
    const pathname = usePathname();
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Glassmorphic Container */}
            <div className="bg-background/80 backdrop-blur-xl border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
                <nav
                    className="flex items-center justify-around h-[60px] px-2 relative"
                    onMouseLeave={() => setHoveredLink(null)}
                >
                    {NAV_LINKS.map((link) => {
                        const active = isActive(pathname, link.href);
                        const isHovered = hoveredLink === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="relative flex flex-col items-center justify-center w-full h-full group"
                                onMouseEnter={() => setHoveredLink(link.href)}
                            >
                                <div className={cn(
                                    "flex flex-col items-center justify-center h-full w-full transition-all duration-200",
                                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}>
                                    <div className="relative">
                                        <link.icon className={cn(
                                            "h-6 w-6 transition-all duration-200",
                                            active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                                        )} />
                                        {link.label === "Messages" && (
                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-background"></span>
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-medium mt-1">
                                        {link.label}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}



