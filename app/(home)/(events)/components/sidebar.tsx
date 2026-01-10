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
                "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar -mx-4 px-4 lg:px-0 lg:mx-0",
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
                            "group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 shrink-0",
                            isActive
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                    >
                        <span className={cn(
                            "flex items-center justify-center transition-colors",
                            isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                        )}>
                            {item.icon}
                        </span>
                        <span className="truncate">{item.title}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
