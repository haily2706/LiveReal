"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    items: {
        href: string
        title: string
        icon?: React.ReactNode
    }[]
}

export function Sidebar({ className, items, ...props }: SidebarNavProps) {
    const pathname = usePathname()

    return (
        <nav
            className={cn(
                "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:px-0 lg:mx-0",
                className
            )}
            {...props}
        >
            {items.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            buttonVariants({ variant: "ghost" }),
                            isActive
                                ? "bg-accent hover:bg-accent text-foreground font-medium"
                                : "hover:bg-accent/50 hover:text-foreground text-muted-foreground",
                            "justify-start relative transition-all duration-200 ease-in-out px-4 py-2.5 h-auto rounded-xl shrink-0"
                        )}
                    >
                        <span className={cn("mr-1 transition-colors", isActive ? "text-pink-500" : "text-muted-foreground")}>
                            {item.icon}
                        </span>
                        <span className="relative z-10 text-sm whitespace-nowrap">{item.title}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
