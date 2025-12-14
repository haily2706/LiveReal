"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/app/components/theme/mode-toggle";
import { useAuthModal } from "@/app/components/auth/use-auth-modal";
import { useAuthStore } from "@/app/components/auth/use-auth-store";
import { UserMenu } from "@/app/components/auth/user-menu";

const navLinks = [
    { name: "How it Works", href: "/#how-it-works" }, // Absolute paths for cross-page nav
    { name: "Features", href: "/#features" },
    { name: "Wallet", href: "/#hbar-wallet" },
    { name: "Gifts", href: "/#gifts" },
    { name: "Stories", href: "/#testimonials" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Investors", href: "/investors" },
];

export function Navbar() {
    const pathname = usePathname();

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("");
    const { onOpen } = useAuthModal();
    const { user } = useAuthStore();

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
    }, [isMobileMenuOpen]);

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
                const id = link.href.split('#')[1];
                const section = document.getElementById(id);
                if (section) observer.observe(section);
            }
        });

        return () => observer.disconnect();
    }, []);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
                <div className="container mx-auto flex items-center justify-between px-4 py--0">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/text-logo.svg"
                            alt="LiveReal Logo"
                            width={160}
                            height={40}
                            className="w-auto h-16 hover:opacity-80 transition-opacity"
                            priority
                        />
                    </Link>

                    {/* Desktop Links */}
                    <nav className="hidden md:flex items-center gap-8">
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
                    <div className="hidden md:flex items-center gap-4">
                        <ModeToggle />
                        {user ? (
                            <>
                                <Link href="/home">
                                    <Button
                                        variant="ghost"
                                        className="hover:text-pink-500 hover:bg-pink-500/10 active:scale-95 transition-all"
                                    >
                                        Home
                                    </Button>
                                </Link>
                                {(user?.app_metadata?.role === 'Admin' || user?.app_metadata?.role === 'Manager') && (
                                    <Link href="/dashboard">
                                        <Button
                                            variant="ghost"
                                            className="hover:text-pink-500 hover:bg-pink-500/10 active:scale-95 transition-all"
                                        >
                                            Dashboard
                                        </Button>
                                    </Link>
                                )}
                                <UserMenu email={user.email} />
                            </>
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
                                    className="bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/20 active:scale-95 transition-all"
                                    onClick={() => onOpen("sign_up")}
                                >
                                    Sign Up
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Trigger */}
                    <div className="flex md:hidden flex-1 justify-end">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Open menu</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-100 flex flex-col bg-background/95 backdrop-blur-3xl p-6 md:hidden"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <Image
                                src="/text-logo.svg"
                                alt="LiveReal Logo"
                                width={160}
                                height={40}
                                className="h-10 w-auto"
                            />
                            <div className="flex items-center gap-4">
                                <ModeToggle />
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                    <span className="sr-only">Close menu</span>
                                </button>
                            </div>
                        </div>

                        <nav className="flex flex-col gap-6">
                            {navLinks.map((link) => {
                                const isActive = link.href.includes("#")
                                    ? activeSection === `#${link.href.split('#')[1]}`
                                    : pathname === link.href;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`text-lg font-medium transition-colors ${isActive
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-auto space-y-4 border-t pt-6">
                            {user ? (
                                <>
                                    <Link href="/home" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button
                                            className="w-full h-12 text-lg hover:text-pink-500 hover:bg-pink-500/10"
                                            variant="outline"
                                        >
                                            Home
                                        </Button>
                                    </Link>
                                    {(user?.app_metadata?.role === 'admin' || user?.app_metadata?.role === 'manager') && (
                                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button
                                                className="w-full h-12 text-lg bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/20"
                                            >
                                                Dashboard
                                            </Button>
                                        </Link>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Button
                                        className="w-full h-12 text-lg hover:text-pink-500 hover:bg-pink-500/10"
                                        variant="outline"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            onOpen("sign_in");
                                        }}
                                    >
                                        Sign In
                                    </Button>
                                    <Button
                                        className="w-full h-12 text-lg bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-pink-500/20"
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
                )}
            </AnimatePresence>
        </>
    );
}
