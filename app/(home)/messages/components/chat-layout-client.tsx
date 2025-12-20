"use client";

import { useCallback, useState } from "react";
import { ConversationList } from "./conversation-list";
import { ChatWindow } from "./chat-window";
import { EmptyChatState } from "./empty-state";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatLayoutClientProps {
    conversationId?: string;
    userId: string;
}

export function ChatLayoutClient({ conversationId, userId }: ChatLayoutClientProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isVideoCallActive, setIsVideoCallActive] = useState(false);

    const handleVideoCallChange = useCallback((isActive: boolean) => {
        setIsVideoCallActive(current => {
            if (isActive !== current) {
                // Auto-collapse (hide) when call starts, auto-expand (icon mode or full) when call ends
                // We'll default to collapsing when call starts to maximize space.
                setIsCollapsed(isActive);
            }
            return isActive;
        });
    }, []);

    return (
        <div className={cn(
            "flex w-full overflow-hidden relative bg-background/50 transition-all duration-300",
            "h-[calc(100dvh-64px)] md:h-[calc(100vh-64px)]"
        )}>
            {/* Global Ambient Background */}
            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-background/50 to-pink-500/5 -z-10" />

            {/* Sidebar Container */}
            <div className={cn(
                "shrink-0 h-full border-r border-border/40 transition-all duration-300 relative bg-background/30 backdrop-blur-sm",
                conversationId ? 'hidden md:block' : 'block w-full md:block md:w-auto',
                // When video is active and collapsed (width 0), we hide overflow and borders to make it truly invisible
                isVideoCallActive && isCollapsed ? "border-r-0" : ""
            )}>
                <motion.div
                    initial={false}
                    animate={{
                        // Normal behavior: 88px (icons) when collapsed.
                        // Video behavior: 0px (hidden) when collapsed.
                        width: isCollapsed ? (isVideoCallActive ? 0 : 88) : 350,
                        opacity: isCollapsed && isVideoCallActive ? 0 : 1
                    }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full hidden md:block overflow-hidden"
                >
                    <div className="h-full w-[350px]">
                        <ConversationList
                            isCollapsed={isCollapsed}
                            onToggle={() => setIsCollapsed(!isCollapsed)}
                            allowCollapse={isVideoCallActive} // Pass this if ConversationList needs to know, or just rely on width
                        />
                    </div>
                </motion.div>

                {/* Mobile version - no animation, just full width */}
                <div className="h-full w-full md:hidden">
                    <ConversationList
                        isCollapsed={false}
                    />
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 h-full relative flex min-w-0">
                {conversationId ? (
                    <div className="w-full h-full">
                        <ChatWindow
                            conversationId={conversationId}
                            currentUserId={userId}
                            onVideoCallChange={handleVideoCallChange}
                            isSidebarCollapsed={isCollapsed}
                            onToggleSidebar={() => setIsCollapsed(prev => !prev)}
                        />
                    </div>
                ) : (
                    <EmptyChatState />
                )}
            </div>
        </div>
    );
}
