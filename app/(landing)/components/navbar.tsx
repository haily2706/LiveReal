"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { useAuthModal } from "@/components/auth/use-auth-modal";
import { useAuthStore } from "@/components/auth/use-auth-store";
import { UserMenu } from "@/components/auth/user-menu";
import { TextLogo } from "@/components/ui/text-logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
    { name: "How it Works", href: "/#how-it-works" }, // Absolute paths for cross-page nav
    { name: "Gifts", href: "/#gifts" },
    { name: "Features", href: "/#features" },
    { name: "Wallet", href: "/#hbar-wallet" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Investors", href: "/investors" },
];

export function Navbar() {
    const pathname = usePathname();

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [activeSection, setActiveSection] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { onOpen } = useAuthModal();
    const { user, isLoading } = useAuthStore();

    // Handle scroll spy
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(`#${entry.target.id}`);
                    }
                });
            },
            {
                rootMargin: "-20% 0px -35% 0px",
                threshold: 0,
            }
        );

        navLinks.forEach((link) => {
            // Check if href is an anchor link (contains #)
            if (link.href.includes("#")) {
                // Extract the id part
                const parts = link.href.split('#');
                if (parts.length > 1) {
                    const id = parts[1];
                    const section = document.getElementById(id);
                    if (section) observer.observe(section);
                }
            }
        });

        return () => observer.disconnect();
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto flex h-16 items-center px-4 md:px-6 gap-4">

                {/* Mobile Menu Trigger & Logo */}
                <div className="flex items-center gap-2 flex-1 lg:flex-none">
                    <div className="lg:hidden">
                        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="-ml-2 text-muted-foreground hover:text-foreground hover:bg-accent">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[260px] border-r border-border p-0">
                                <SheetHeader className="p-6 border-border">
                                    <SheetTitle asChild>
                                        <Link href="/" className="flex items-center gap-3" onClick={() => setIsSheetOpen(false)}>
                                            <TextLogo />
                                        </Link>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col h-full overflow-y-auto">
                                    <nav className="flex flex-col gap-1 p-4">
                                        {navLinks.map((link) => {
                                            const isActive = link.href.includes("#")
                                                ? activeSection === `#${link.href.split('#')[1]}`
                                                : pathname === link.href;
                                            return (
                                                <Link
                                                    key={link.name}
                                                    href={link.href}
                                                    onClick={() => setIsSheetOpen(false)}
                                                    className={cn(
                                                        "group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                                                        isActive
                                                            ? "bg-muted text-foreground"
                                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                                    )}
                                                >
                                                    {link.name}
                                                </Link>
                                            );
                                        })}
                                        {user ? (
                                            <div className="mt-2 pt-4 border-border/50">
                                                <Link
                                                    href="/home"
                                                    onClick={() => setIsSheetOpen(false)}
                                                    className="group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200"
                                                >
                                                    Dashboard
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="mt-4 pt-4  border-border/50 flex flex-col gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start hover:text-pink-500 hover:bg-pink-500/10"
                                                    onClick={() => {
                                                        setIsSheetOpen(false);
                                                        onOpen("sign_in");
                                                    }}
                                                >
                                                    Sign In
                                                </Button>
                                                <Button
                                                    className="w-full justify-start bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/20 text-white"
                                                    onClick={() => {
                                                        setIsSheetOpen(false);
                                                        onOpen("sign_up");
                                                    }}
                                                >
                                                    Sign Up
                                                </Button>
                                            </div>
                                        )}
                                    </nav>
                                    <div className="mt-auto p-4 border-t border-border">
                                        {user && (
                                            <div className="flex items-center gap-2">
                                                <UserMenu email={user.email} />
                                                <span className="text-sm font-medium text-muted-foreground truncate">{user.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link href="/" className="flex items-center gap-2">
                        <TextLogo />
                    </Link>
                </div>

                {/* Desktop Links */}
                <nav className="hidden lg:flex items-center gap-8 justify-center flex-1">
                    {navLinks.map((link, index) => {
                        const isActive = link.href.includes("#")
                            ? activeSection === `#${link.href.split('#')[1]}`
                            : pathname === link.href;

                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`relative text-sm font-medium transition-colors ${isActive
                                    ? "text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {link.name}
                                {(hoveredIndex === index || (isActive && hoveredIndex === null)) && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-linear-to-r from-pink-500 to-purple-500"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Desktop Right Side */}
                <div className="hidden lg:flex items-center gap-4 flex-none">
                    <ModeToggle />
                    <Link href="/home">
                        <Button
                            variant="ghost"
                            className="hover:text-pink-500 hover:bg-pink-500/10 active:scale-95 transition-all cursor-pointer"
                        >
                            Home
                        </Button>
                    </Link>
                    {isLoading ? (
                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse ml-auto" />
                    ) : user ? (
                        <UserMenu email={user.email} />
                    ) : (
                        <>
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
                        </>
                    )}
                </div>

                {/* Mobile Right Side */}
                <div className="flex lg:hidden items-center gap-2">
                    <ModeToggle />
                    {!user && (
                        <>
                            <Link href="/home">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:text-pink-500 hover:bg-pink-500/10 active:scale-95 transition-all cursor-pointer"
                                >
                                    Home
                                </Button>
                            </Link>
                            <Button
                                size="sm"
                                className="bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/20 active:scale-95 transition-all text-white"
                                onClick={() => onOpen("sign_up")}
                            >
                                Sign Up
                            </Button>
                        </>
                    )}
                    {user && <UserMenu email={user.email} />}
                </div>
            </div>
        </header>
    );
}
