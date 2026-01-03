"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Settings,
    LogOut,
    Menu,
    Wallet,
    CircleGauge,
    Users,
    Zap,
    Sparkles,
    ChevronDown,
    ChevronRight,
    CreditCard,
    Banknote
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/components/auth/use-auth-store";
import { useAuthModal } from "@/components/auth/use-auth-modal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "./provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";


export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isCollapsed, toggleSidebar } = useSidebar();
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ "Transactions": true }); // Default open for better visibility
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
        router.push("/");
    };

    const toggleGroup = (label: string) => {
        if (isCollapsed) {
            toggleSidebar(); // Auto expand sidebar if clicking a group
            setTimeout(() => {
                setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
            }, 100);
        } else {
            setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
        }
    };

    const menuItems = [
        { icon: CircleGauge, label: "Dashboard", href: "/dashboard", color: "text-blue-400" },
        { icon: Users, label: "Users", href: "/dashboard/users", color: "text-pink-400" },
        {
            icon: Wallet,
            label: "Transactions",
            href: "#transactions", // Virtual href for grouping
            color: "text-purple-400",
            children: [
                { icon: Banknote, label: "Cash Ins", href: "/dashboard/cash-ins", color: "text-green-400" },
                { icon: CreditCard, label: "Cash Outs", href: "/dashboard/cash-outs", color: "text-orange-400" },
                { icon: Zap, label: "Subscriptions", href: "/dashboard/subscriptions", color: "text-yellow-400" },
            ]
        },
        { icon: Settings, label: "Settings", href: "/dashboard/settings", color: "text-gray-400" }
    ];

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

            <div className={cn("h-14 flex items-center relative z-20", isCollapsed ? "justify-center" : "justify-between px-2")}>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-full shrink-0 transition-all duration-300 hover:rotate-180"
                    onClick={toggleSidebar}
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </div>

            <div className=" mt-4 flex flex-col flex-1 h-full overflow-y-auto custom-scrollbar relative z-10 px-2 space-y-2 pb-4 gap-4">
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
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : null}
                </div>

                {/* Main Links */}
                <div className="flex-1 space-y-2">
                    {!isCollapsed && (
                        <h3 className="px-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 pl-4">Menu</h3>
                    )}
                    <div className="space-y-1" onMouseLeave={() => setHoveredLink(null)}>
                        {menuItems.map((item) => (
                            <SidebarItem
                                key={item.label}
                                item={item}
                                pathname={pathname}
                                isCollapsed={isCollapsed}
                                isHovered={hoveredLink === item.label}
                                onHover={() => setHoveredLink(item.label)}
                                isOpen={openGroups[item.label]}
                                toggleOpen={() => toggleGroup(item.label)}
                            />
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
                        <Menu className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </aside>
    );
}

function SidebarItem({
    item,
    pathname,
    isCollapsed,
    isHovered,
    onHover,
    isOpen,
    toggleOpen
}: {
    item: any,
    pathname: string,
    isCollapsed: boolean,
    isHovered: boolean,
    onHover: () => void,
    isOpen?: boolean,
    toggleOpen?: () => void
}) {
    // Check if this item or any of its children are active
    const isActiveLink = (href: string) => {
        if (href === "/dashboard") return pathname === href;
        return pathname === href || pathname?.startsWith(`${href}/`);
    };

    const isChildActive = item.children?.some((child: any) => isActiveLink(child.href));
    const active = isActiveLink(item.href) || isChildActive;

    if (item.children) {
        if (isCollapsed) {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div
                            onMouseEnter={onHover}
                            className={cn(
                                "relative flex items-center transition-all duration-300 group rounded-2xl mx-auto overflow-hidden cursor-pointer select-none justify-center w-12 h-12 px-0 py-3",
                                active && "bg-linear-to-r from-[#FF3B5C]/10 via-purple-500/5 to-transparent"
                            )}
                        >
                            {/* Active Indicator Bar (Parent) */}
                            {active && (
                                <motion.div
                                    layoutId="active-indicator-parent"
                                    className="absolute left-0 w-[3px] h-6 bg-[#FF3B5C] rounded-r-full shadow-[0_0_10px_#FF3B5C]"
                                    initial={{ opacity: 0, scaleY: 0.5 }}
                                    animate={{ opacity: 1, scaleY: 1 }}
                                    transition={{ duration: 0.2 }}
                                />
                            )}

                            {/* Hover BG */}
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
                                "relative z-10 flex items-center justify-center transition-all duration-300",
                                active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                            )}>
                                <item.icon className={cn(
                                    "h-[22px] w-[22px] transition-all duration-300",
                                    active ? "text-[#FF3B5C] drop-shadow-[0_0_8px_rgba(255,59,92,0.5)]" : "",
                                    !active && isHovered ? item.color : "",
                                    "group-hover:scale-110"
                                )} />
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" sideOffset={10} className="w-[200px] ml-2 backdrop-blur-xl bg-background/80">
                        <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {item.children.map((child: any) => (
                            <DropdownMenuItem key={child.href} asChild>
                                <Link href={child.href} className="cursor-pointer flex items-center gap-2">
                                    <child.icon className={cn("h-4 w-4", child.color)} />
                                    <span>{child.label}</span>
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }

        return (
            <div className="space-y-1">
                <div
                    onClick={toggleOpen}
                    onMouseEnter={onHover}
                    className={cn(
                        "relative flex items-center transition-all duration-300 group px-3 py-3 rounded-2xl mx-2 overflow-hidden cursor-pointer select-none",
                        isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "w-auto justify-between",
                        active && !isOpen && "bg-linear-to-r from-[#FF3B5C]/10 via-purple-500/5 to-transparent"
                    )}
                >
                    {/* Active Indicator Bar (Parent) only if closed and active child */}
                    {active && !isOpen && (
                        <motion.div
                            layoutId="active-indicator-parent"
                            className="absolute left-0 w-[3px] h-6 bg-[#FF3B5C] rounded-r-full shadow-[0_0_10px_#FF3B5C]"
                            initial={{ opacity: 0, scaleY: 0.5 }}
                            animate={{ opacity: 1, scaleY: 1 }}
                            transition={{ duration: 0.2 }}
                        />
                    )}

                    {/* Hover BG */}
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
                        <item.icon className={cn(
                            "h-[22px] w-[22px] transition-all duration-300",
                            active ? "text-[#FF3B5C] drop-shadow-[0_0_8px_rgba(255,59,92,0.5)]" : "",
                            !active && isHovered ? item.color : "",
                            "group-hover:scale-110"
                        )} />

                        {!isCollapsed && (
                            <span className={cn(
                                "text-sm font-medium tracking-wide transition-all duration-300",
                                active ? "font-bold" : ""
                            )}>
                                {item.label}
                            </span>
                        )}
                    </div>

                    {!isCollapsed && (
                        <div className="relative z-10 text-muted-foreground">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {isOpen && !isCollapsed && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-col space-y-1 ml-4 border-l border-border/50 pl-2">
                                {item.children.map((child: any) => (
                                    <SidebarLink
                                        key={child.href}
                                        link={child}
                                        pathname={pathname}
                                        isCollapsed={isCollapsed}
                                        isHovered={false} // No hover effect from parent
                                        onHover={() => { }} // No hover logic needed for children for now or can implement individual hover
                                        isChild={true}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <SidebarLink
            link={item}
            pathname={pathname}
            isCollapsed={isCollapsed}
            isHovered={isHovered}
            onHover={onHover}
        />
    );
}

function SidebarLink({
    link,
    pathname,
    isCollapsed,
    isHovered,
    onHover,
    isChild = false
}: {
    link: any,
    pathname: string,
    isCollapsed: boolean,
    isHovered: boolean,
    onHover: () => void,
    isChild?: boolean
}) {
    const isActiveLink = (href: string) => {
        if (href === "/dashboard") return pathname === href;
        return pathname === href || pathname?.startsWith(`${href}/`);
    };

    const active = isActiveLink(link.href);

    return (
        <Link
            href={link.href}
            className="block"
            onMouseEnter={onHover}
        >
            <div
                className={cn(
                    "relative flex items-center transition-all duration-300 group rounded-2xl overflow-hidden",
                    isChild ? "px-3 py-2 mx-1" : "px-3 py-3 mx-2",
                    isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "w-auto",
                    active && "bg-linear-to-r from-[#FF3B5C]/10 via-purple-500/5 to-transparent"
                )}
            >

                {/* Active Indicator Bar */}
                {active && (
                    <motion.div
                        layoutId={`active-indicator-${link.href}`}
                        className={cn(
                            "absolute left-0 bg-[#FF3B5C] rounded-r-full shadow-[0_0_10px_#FF3B5C]",
                            isChild ? "w-[2px] h-4" : "w-[3px] h-6"
                        )}
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
                        "transition-all duration-300",
                        isChild ? "h-[18px] w-[18px]" : "h-[22px] w-[22px]",
                        active ? "text-[#FF3B5C] drop-shadow-[0_0_8px_rgba(255,59,92,0.5)]" : "",
                        !active && isHovered ? link.color : "",
                        isCollapsed ? "" : "",
                        "group-hover:scale-110"
                    )} />

                    {!isCollapsed && (
                        <span className={cn(
                            "font-medium tracking-wide transition-all duration-300",
                            isChild ? "text-xs" : "text-sm",
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

