"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthModal } from "@/components/auth/use-auth-modal";
import { useAuthStore } from "@/components/auth/use-auth-store";
import { UserMenu } from "@/components/auth/user-menu";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TextLogo } from "@/components/ui/text-logo";
import {
    CircleGauge,
    Users,
    Wallet,
    ArrowDownLeft,
    ArrowUpRight,
    ArrowRightLeft,
    Sparkles,
    Settings,
    Menu,
    ChevronDown,
    ChevronRight
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sidebarLinks = [
    { icon: CircleGauge, label: "Dashboard", href: "/dashboard", color: "text-blue-400" },
    { icon: Users, label: "Users", href: "/dashboard/users", color: "text-pink-400" },
    {
        icon: Wallet,
        label: "Transactions",
        href: "#transactions",
        color: "text-purple-400",
        children: [
            { icon: ArrowDownLeft, label: "Cash Ins", href: "/dashboard/cash-ins", color: "text-green-400" },
            { icon: ArrowUpRight, label: "Cash Outs", href: "/dashboard/cash-outs", color: "text-orange-400" },
            { icon: ArrowRightLeft, label: "Transfers", href: "/dashboard/transfers", color: "text-cyan-400" },
            { icon: Sparkles, label: "Subscriptions", href: "/dashboard/subscriptions", color: "text-yellow-400" },
        ]
    },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", color: "text-gray-400" }
];

export function Navbar() {
    const pathname = usePathname();
    const { onOpen } = useAuthModal();
    const { user, isLoading } = useAuthStore();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ "Transactions": true });

    const toggleGroup = (label: string) => {
        setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <header className={cn(
            "sticky top-0 z-50 w-full h-15",
            "bg-background/80 backdrop-blur-2xl border-b border-border",
            "transition-all duration-300"
        )}>
            {/* Ambient Gradient Top Line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent" />

            <div className="flex h-full items-center px-6 gap-4">
                {/* Left Section: Mobile Menu & Title */}
                <div className="flex items-center gap-2 flex-1">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-muted-foreground hover:text-foreground hover:bg-accent">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[220px] border-r border-border p-0">
                            <SheetHeader className="p-6 border-border">
                                <SheetTitle asChild>
                                    <Link href="/dashboard" className="flex items-center gap-3">
                                        <TextLogo />
                                    </Link>
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-1 p-4 overflow-y-auto max-h-[calc(100vh-100px)]">
                                {sidebarLinks.map((item) => {
                                    const isActiveLink = (href: string) => {
                                        if (href === "/dashboard") return pathname === href;
                                        return pathname === href || pathname?.startsWith(`${href}/`);
                                    };
                                    const isChildActive = item.children?.some((child) => isActiveLink(child.href));
                                    const active = isActiveLink(item.href) || isChildActive;
                                    const isOpen = openGroups[item.label];

                                    if (item.children) {
                                        return (
                                            <div key={item.label} className="space-y-1">
                                                <div
                                                    onClick={() => toggleGroup(item.label)}
                                                    className={cn(
                                                        "relative flex items-center justify-between transition-all duration-200 group px-3 py-2 rounded-lg cursor-pointer select-none",
                                                        active && !isOpen
                                                            ? "bg-muted text-foreground"
                                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <item.icon className={cn(
                                                            "h-5 w-5 transition-all duration-200",
                                                            active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                                                        )} />
                                                        <span className="text-sm truncate">{item.label}</span>
                                                    </div>
                                                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                </div>
                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="flex flex-col space-y-1 ml-4 border-l border-border/50 pl-2">
                                                                {item.children.map((child) => {
                                                                    const childActive = isActiveLink(child.href);
                                                                    return (
                                                                        <Link
                                                                            key={child.href}
                                                                            href={child.href}
                                                                            className={cn(
                                                                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                                                                                childActive
                                                                                    ? "bg-muted text-foreground font-medium"
                                                                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                                                            )}
                                                                        >
                                                                            <child.icon className={cn(
                                                                                "h-5 w-5 transition-all duration-200",
                                                                                childActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                                                            )} />
                                                                            <span className="text-sm truncate">{child.label}</span>
                                                                        </Link>
                                                                    );
                                                                })}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                                                active
                                                    ? "bg-muted text-foreground font-medium"
                                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                            )}
                                        >
                                            <item.icon className={cn(
                                                "h-5 w-5 transition-all duration-200",
                                                active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                            )} />
                                            <span className="text-sm truncate">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    <Link href="/">
                        <TextLogo />
                    </Link>
                </div>

                {/* Right Section: Actions */}
                <div className="flex items-center justify-end gap-3 flex-1">
                    <div className="hidden md:flex items-center mr-2">
                        <Link href="/home">
                            <Button
                                variant="ghost"
                                className="hover:text-pink-500 hover:bg-pink-500/10 active:scale-95 transition-all"
                            >
                                Home
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center gap-1 border-r border-border pr-3 mr-1">

                        <div className="hover:bg-accent rounded-full transition-colors">
                            <ModeToggle />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    ) : user ? (
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-75 transition duration-500" />
                            <div className="relative">
                                <UserMenu email={user.email} />
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            onClick={() => onOpen("sign_in")}
                            className="bg-accent/50 hover:bg-accent text-foreground hover:text-foreground border border-border rounded-xl"
                        >
                            Sign In
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}

