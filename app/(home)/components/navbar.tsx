"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import {
    X,
    Search,
    Mic,
    Menu,
    Video,
    Plus,
    Radio,
    PenSquare,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthModal } from "@/components/auth/use-auth-modal";

import { currentUser } from "@/lib/data";

import { ModeToggle } from "@/components/theme/mode-toggle";
import { NotiDropdown } from "./noti-dropdown";
import { TextLogo } from "@/components/ui/text-logo";

const appLinks = [
    { name: "Explore", href: "/home" },
    { name: "Settings", href: "/settings" },
];

import { useAuthStore } from "@/components/auth/use-auth-store";
import { UserMenu } from "@/components/auth/user-menu";
import { EventTypes } from "@/lib/constants";
import { CreateEventModal } from "./create-event-modal";

export const categories = [
    "All",
    ...EventTypes.map((type) => type.name),
];

interface NavbarProps { }

export function Navbar({ }: NavbarProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedEventType, setSelectedEventType] = useState<number | null>(null);
    const { onOpen } = useAuthModal();
    const { user, isLoading } = useAuthStore();

    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedCategory = searchParams.get("category") || "All";

    const handleSelect = (category: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (category === "All") {
            params.delete("category");
        } else {
            params.set("category", category);
        }
        router.push(`?${params.toString()}`);
    };

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isMobileMenuOpen]);

    return (
        <>
            <header
                className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/80"
            >
                <div className="flex h-16 items-center justify-between px-6 relative z-10 gap-4">
                    <div className="flex items-center gap-2">
                        {/* <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="-ml-2"
                            >
                                <Menu className="h-6 w-6" />
                            </Button>
                        </div> */}
                        <Link href="/">
                            <TextLogo />
                        </Link>
                    </div>

                    {/* Center Section - Toggle between Pills and Search */}
                    <div className="hidden md:flex flex-1 max-w-[850px] items-center justify-center bg-transparent relative">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {isSearchFocused ? (
                                <motion.div
                                    key="search-bar"
                                    initial={{ opacity: 0, scale: 0.9, width: "50%" }}
                                    animate={{ opacity: 1, scale: 1, width: "100%" }}
                                    exit={{ opacity: 0, scale: 0.9, width: "50%" }}
                                    className="flex flex-1 items-center relative max-w-[600px] w-full"
                                >
                                    <div className="relative w-full group">
                                        <div className="relative flex items-center bg-background/60 dark:bg-background/40 backdrop-blur-md rounded-full border border-border overflow-hidden shadow-lg">
                                            <div className="pl-4 text-muted-foreground">
                                                <Search className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <input
                                                type="text"
                                                autoFocus
                                                placeholder="Search..."
                                                onBlur={() => {
                                                    // Optional: close on blur if empty ? 
                                                    // For now, let's keep it manual toggle via X button to avoid annoyance
                                                }}
                                                className="w-full h-10 px-4 bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0"
                                            />
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => setIsSearchFocused(false)}
                                                className="h-9 w-9 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all mr-1"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="ml-4 p-2.5 rounded-full bg-background/60 dark:bg-background/40 border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors backdrop-blur-md"
                                    >
                                        <Mic className="h-5 w-5" />
                                    </motion.button>
                                </motion.div>
                            ) : pathname === '/home' ? (
                                <motion.div
                                    key="category-pills"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2"
                                >
                                    {categories.map((category) => {
                                        const isSelected = selectedCategory === category;
                                        return (
                                            <Button
                                                key={category}
                                                variant={isSelected ? "default" : "secondary"}
                                                onClick={() => handleSelect(category)}
                                                className={cn(
                                                    "whitespace-nowrap rounded-full text-xs font-medium transition-all duration-300 h-8 px-4",
                                                    isSelected
                                                        ? "bg-foreground text-background hover:bg-foreground/90 shadow-[0_0_15px_rgba(var(--foreground),0.3)]"
                                                        : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                                                )}
                                            >
                                                {category}
                                            </Button>
                                        );
                                    })}
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Search className="h-5 w-5" />
                            </Button>
                        </div>
                        {/* Desktop Search Trigger */}
                        <AnimatePresence initial={false}>
                            {!isSearchFocused && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    className="hidden md:block"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-foreground rounded-full"
                                        onClick={() => setIsSearchFocused(true)}
                                    >
                                        <Search className="h-5 w-5" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>



                        {user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        className="hidden md:flex items-center gap-2 rounded-full bg-muted/50 hover:bg-muted text-foreground border border-input px-4 transition-all"
                                        variant="ghost"
                                        size="default"
                                    >
                                        <Plus className="h-5 w-5" />
                                        <span className="font-medium">Schedule</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-xl border border-border/50 bg-background/80 backdrop-blur-xl p-2 shadow-xl">
                                    {EventTypes.map((type) => (
                                        <DropdownMenuItem
                                            key={type.value}
                                            onClick={() => {
                                                setSelectedEventType(type.value);
                                                setIsCreateModalOpen(true);
                                            }}
                                            className="flex items-center gap-3 p-3 cursor-pointer rounded-lg focus:bg-muted font-medium transition-colors"
                                        >
                                            <type.icon className="h-5 w-5" />
                                            {type.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        <CreateEventModal
                            isOpen={isCreateModalOpen}
                            onClose={() => setIsCreateModalOpen(false)}
                            initialEventType={selectedEventType}
                        />



                        <div className="scale-90">
                            <ModeToggle />
                        </div>

                        {isLoading ? (
                            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                        ) : user ? (
                            <UserMenu email={user.email} />
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    className="hover:text-pink-500 hover:bg-pink-500/10 active:scale-95 transition-all"
                                    onClick={() => onOpen("sign_in")}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    className="bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/20 active:scale-95 transition-all text-white"
                                    onClick={() => onOpen("sign_up")}
                                >
                                    Sign Up
                                </Button>
                            </div>
                        )}

                    </div>
                </div>
                {/* Mobile Categories - Visible only on mobile and /home */}
                {pathname === '/home' && (
                    <div className="md:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 no-scrollbar border-t border-border/50">
                        {categories.map((category) => {
                            const isSelected = selectedCategory === category;
                            return (
                                <Button
                                    key={category}
                                    variant={isSelected ? "default" : "secondary"}
                                    onClick={() => handleSelect(category)}
                                    className={cn(
                                        "whitespace-nowrap rounded-full text-xs font-medium transition-all duration-300 h-7 px-3 shrink-0",
                                        isSelected
                                            ? "bg-foreground text-background hover:bg-foreground/90"
                                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                                    )}
                                >
                                    {category}
                                </Button>
                            );
                        })}
                    </div>
                )}
            </header>

            {/* Mobile Search - Visible only on mobile */}
            <AnimatePresence>
                {
                    isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}


                            className="md:hidden flex flex-col fixed inset-0 z-50 bg-background/95 backdrop-blur-3xl p-4"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <Link href="/">
                                    <TextLogo />
                                </Link>
                                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            <div className="relative group mb-6">
                                <div className="relative flex items-center bg-background rounded-lg border border-border px-4 py-3">
                                    <Search className="h-5 w-5 text-muted-foreground mr-3" />
                                    <input
                                        className="flex-1 bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground"
                                        placeholder="Search..."
                                        autoFocus
                                    />
                                    <Mic className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>

                            <nav className="flex flex-col gap-4">
                                {appLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-lg font-medium p-4 rounded-xl hover:bg-muted transition-colors flex items-center gap-4"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </nav>

                            <div className="mt-auto pb-4">
                                {!user && (
                                    <>
                                        <Button
                                            className="mb-4 w-full h-12 text-lg hover:text-pink-500 hover:bg-pink-500/10"
                                            variant="outline"
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                onOpen("sign_in");
                                            }}
                                        >
                                            Sign In
                                        </Button>
                                        <Button
                                            className="w-full h-12 text-lg bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/20 text-white"
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                onOpen("sign_up");
                                            }}
                                        >
                                            Sign Up
                                        </Button>
                                    </>
                                )}
                            </div>

                        </motion.div>
                    )
                }
            </AnimatePresence >
        </>
    );
}


