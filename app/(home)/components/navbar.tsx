"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
    X,
    Search,
    Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { currentUser } from "@/lib/data";

import { ModeToggle } from "@/app/components/mode-toggle";
import { NotificationDropdown } from "./notification-dropdown";

const appLinks = [
    { name: "Home", href: "/home" },
    { name: "Explore", href: "/explore" },
    { name: "Shorts", href: "/shorts" },
    { name: "Messages", href: "/messages" },
    { name: "Schedules", href: "/schedules" },
];

export function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

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
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/80"
            >
                <div className="flex h-16 items-center justify-between px-4 relative z-10 gap-4">

                    <CategoryPills />
                    <div className="hidden md:flex flex-1 max-w-[850px] items-center justify-center bg-transparent">

                        <motion.div
                            className={`flex flex-1 items-center relative max-w-[600px] transition-all duration-300 ${isSearchFocused ? "scale-105" : ""}`}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        >
                            <div className="relative w-full group">
                                <div className="relative flex items-center bg-background/60 dark:bg-background/40 backdrop-blur-md rounded-full border border-border overflow-hidden">
                                    <div className="pl-4 text-muted-foreground">
                                        <Search className={`h-5 w-5 transition-colors ${isSearchFocused ? "text-blue-500 dark:text-blue-400" : ""}`} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full h-10 px-4 bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0"
                                    />
                                    <Button
                                        size="icon"
                                        className="h-9 w-12 rounded-r-full bg-muted/50 hover:bg-muted border-l border-border text-muted-foreground hover:text-foreground transition-all mr-0.5"
                                    >
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="ml-4 p-2.5 rounded-full bg-background/60 dark:bg-background/40 border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors backdrop-blur-md"
                            >
                                <Mic className="h-5 w-5" />
                            </motion.button>
                        </motion.div>
                    </div>

                    <div className="flex items-center gap-3">
                        <NotificationDropdown />

                        <div className="scale-90">
                            <ModeToggle />
                        </div>

                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Search className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.header>


            {/* Mobile Search - Visible only on mobile */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden flex flex-col fixed inset-0 z-50 bg-background/95 backdrop-blur-3xl p-4"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <Image
                                src="/logo.svg"
                                alt="iReal Logo"
                                width={120}
                                height={30}
                                className="h-8 w-auto"
                            />
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

                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

const categories = [
    "All",
    "Live",
    "Gaming",
    "Sing"
];

function CategoryPills() {
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

    return (
        <div className="flex items-center gap-2 mr-4 shrink-0">
            {categories.map((category) => (
                <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "secondary"}
                    onClick={() => handleSelect(category)}
                    className={cn(
                        "whitespace-nowrap rounded-full text-xs font-medium transition-all duration-300 h-8 px-4",
                        selectedCategory === category
                            ? "bg-foreground text-background hover:bg-foreground/90 shadow-[0_0_15px_rgba(var(--foreground),0.3)]"
                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                    )}
                >
                    {category}
                </Button>
            ))}
        </div>
    );
}
