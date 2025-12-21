"use client";

import { Separator } from "@/components/ui/separator";
import { Sidebar } from "./components/sidebar";
import { User, Wallet, CreditCard, Settings } from "lucide-react";
import { useSidebar } from "@/app/(home)/components/provider";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
    {
        title: "Profile",
        href: "/settings",
        icon: <User className="w-4 h-4" />,
    },
    {
        title: "Wallet",
        href: "/settings/wallet",
        icon: <Wallet className="w-4 h-4" />,
    },
    {
        title: "Subscriptions",
        href: "/settings/subscriptions",
        icon: <CreditCard className="w-4 h-4" />,
    },
    {
        title: "Preferences",
        href: "/settings/preferences",
        icon: <Settings className="w-4 h-4" />,
    },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="relative min-h-screen">
            <div className={cn(
                "relative z-10 h-full mx-auto p-4 transition-all duration-500 ease-in-out",
                isCollapsed ? "max-w-full px-6" : "max-w-7xl"
            )}>
                <div className="space-y-6">
                    <div className="hidden md:flex flex-col gap-2 mb-6">
                        <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-pink-500 to-purple-500 w-fit">
                            Settings
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Manage your account settings and profile preferences.
                        </p>
                    </div>

                    <div className="flex flex-col space-y-4 lg:flex-row lg:space-x-8 lg:space-y-0">
                        <aside className="lg:w-[220px] lg:border-r lg:pr-6">
                            <Sidebar items={sidebarNavItems} />
                        </aside>
                        <div className={cn("flex-1", isCollapsed ? "max-w-full" : "lg:max-w-4xl")}>
                            <div className="">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
