"use client";

import { Sidebar } from "./components/sidebar";
import { User, Calendar } from "lucide-react";
import { useSidebar } from "@/app/(home)/components/provider";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
    {
        title: "Events",
        href: "/events/list",
        icon: <Calendar className="w-4 h-4" />,
    },
    {
        title: "Profile",
        href: "/events/profile",
        icon: <User className="w-4 h-4" />,
    },
]

export default function EventsLayout({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="relative min-h-screen flex flex-col">
            <div className={cn(
                "relative z-10 mx-auto p-4 transition-all duration-500 ease-in-out flex flex-col flex-1 w-full",
                "max-w-full px-6"
            )}>
                <div className="flex flex-col flex-1 space-y-6">
                    <div className="hidden md:flex flex-col gap-2 mb-6">
                        <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-pink-500 to-purple-500 w-fit">
                            Events
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Manage your events and profile settings.
                        </p>
                    </div>

                    <div className="flex flex-col space-y-4 lg:flex-row lg:space-x-8 lg:space-y-0 flex-1">
                        <aside className="lg:w-[200px] lg:border-r lg:pr-6">
                            <Sidebar items={sidebarNavItems} />
                        </aside>
                        <div className="flex-1 w-full">
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
