import type { Metadata } from "next";
import { Navbar } from "@/app/(dashboard)/components/navbar";
import { Sidebar } from "@/app/(dashboard)/components/sidebar";
import { DashboardProvider } from "@/app/(dashboard)/components/provider";
import { ContentWrapper } from "@/app/(dashboard)/components/content-wrapper";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Dashboard",
};

import { cookies } from "next/headers";
import { BackgroundBlobs } from "@/components/ui/background-blobs";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const defaultCollapsed = cookieStore.get("dashboard-sidebar-collapsed")?.value === "true";

    return (
        <DashboardProvider defaultCollapsed={defaultCollapsed}>
            <BackgroundBlobs />
            <div className="flex min-h-screen bg-transparent text-foreground">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
                    <Suspense fallback={<div className="h-14 border-b border-border/50 bg-background/80" />}>
                        <Navbar />
                    </Suspense>
                    <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                        <ContentWrapper>
                            {children}
                        </ContentWrapper>
                    </main>
                </div>
            </div>
        </DashboardProvider>
    );
}
