import type { Metadata } from "next";
import { Navbar } from "@/app/(home)/components/navbar";
import { Sidebar, MobileBottomNav } from "@/app/(home)/components/sidebar";
import { HomeProvider } from "@/app/(home)/components/provider";
import { Suspense } from "react";

export const metadata: Metadata = {

};

import { cookies } from "next/headers";
import { BackgroundBlobs } from "@/components/ui/background-blobs";
import { StreamManager } from "./components/stream-manager";

export default async function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const defaultCollapsed = (cookieStore.get("sidebar-collapsed")?.value ?? "true") === "true";

    return (
        <HomeProvider defaultCollapsed={defaultCollapsed}>
            <StreamManager>
                <BackgroundBlobs />
                <div className="flex min-h-screen">
                    <Sidebar />
                    <MobileBottomNav />
                    <div className="flex-1 flex flex-col min-w-0">
                        <Suspense fallback={<div className="h-14 border-b border-border/50" />}>
                            <Navbar />
                        </Suspense>
                        <main className="flex-1 pb-20 md:pb-0">
                            {children}
                        </main>
                    </div>
                </div>
            </StreamManager>
        </HomeProvider>
    );
}
