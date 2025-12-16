"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    showPremiumBalance: boolean;
    togglePremiumBalance: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function HomeProvider({
    children,
    defaultCollapsed = true
}: {
    children: React.ReactNode;
    defaultCollapsed?: boolean;
}) {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [showPremiumBalance, setShowPremiumBalance] = useState(true);

    useEffect(() => {
        // Enforce scroll to top on mount to fix navigation from landing page
        window.scrollTo(0, 0);

        const storedBalance = localStorage.getItem("sidebar-show-premium-balance");
        if (storedBalance) {
            setShowPremiumBalance(JSON.parse(storedBalance));
        }
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed((prev) => {
            const newState = !prev;
            document.cookie = `sidebar-collapsed=${newState}; path=/; max-age=31536000; SameSite=Lax`;
            return newState;
        });
    };

    const togglePremiumBalance = () => {
        setShowPremiumBalance((prev) => {
            const newState = !prev;
            localStorage.setItem("sidebar-show-premium-balance", JSON.stringify(newState));
            return newState;
        });
    };

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, showPremiumBalance, togglePremiumBalance }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
