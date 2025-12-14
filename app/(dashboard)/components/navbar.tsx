"use client";

import { usePathname } from "next/navigation";
import { Menu, Search, Bell, Monitor, Moon, Sun } from "lucide-react";
import { useAuthModal } from "@/app/components/auth/use-auth-modal";
import { useAuthStore } from "@/app/components/auth/use-auth-store";
import { UserMenu } from "@/app/components/auth/user-menu";
import { NotiDropdown } from "@/app/(home)/components/noti-dropdown";
import { ModeToggle } from "@/app/components/theme/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LayoutDashboard, Users, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { TextLogo } from "@/components/ui/text-logo";


const mobileLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/dashboard/users", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Back to Home", href: "/home", icon: LogOut },
];

export function Navbar() {
    const pathname = usePathname();
    const { onOpen } = useAuthModal();
    const { user } = useAuthStore();

    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    const pageTitle = lastSegment
        ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1)
        : 'Dashboard';

    return (
        <header className={cn(
            "sticky top-0 z-50 w-full h-14",
            "bg-background/80 backdrop-blur-2xl border-b border-border",
            "transition-all duration-300"
        )}>
            {/* Ambient Gradient Top Line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent" />

            <div className="flex h-full items-center pl-2 pr-4 gap-4">
                {/* Left Section: Mobile Menu & Title */}
                <div className="flex items-center gap-4 flex-1">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-muted-foreground hover:text-foreground hover:bg-accent">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] border-r border-border p-0">
                            <SheetHeader className="p-6 border-b border-border">
                                <SheetTitle asChild>
                                    <Link href="/dashboard" className="flex items-center gap-3">
                                        <TextLogo className="h-10" />
                                    </Link>
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-1 p-4">
                                {mobileLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-300"
                                    >
                                        <link.icon className="h-5 w-5" />
                                        {link.name}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    <TextLogo />
                </div>

                {/* Right Section: Actions */}
                <div className="flex items-center justify-end gap-3 flex-1">
                    <div className="hidden md:flex items-center mr-2">
                        <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
                            <Link href="/home">
                                <LogOut className="h-4 w-4" />
                                <span className="hidden lg:inline">Back to Home</span>
                            </Link>
                        </Button>
                    </div>
                    <div className="flex items-center gap-1 border-r border-border pr-3 mr-1">
                        <div className="hover:bg-accent rounded-full transition-colors">
                            <NotiDropdown />
                        </div>
                        <div className="hover:bg-accent rounded-full transition-colors">
                            <ModeToggle />
                        </div>
                    </div>

                    {user ? (
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

