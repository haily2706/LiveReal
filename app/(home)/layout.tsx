import type { Metadata } from "next";
import { Navbar } from "@/app/(home)/components/navbar";
import { Sidebar } from "@/app/(home)/components/sidebar";
import { HomeProvider } from "@/app/(home)/components/provider";
import { Inter } from "next/font/google";
import "@/app/globals.css";

const outfit = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Home | iReal",
    description: "iReal Dashboard",
};

import { ThemeProvider } from "@/app/components/theme-provider";

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`min-h-screen bg-background text-foreground ${outfit.className} antialiased selection:bg-brand-gold selection:text-black`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <HomeProvider>
                        <div className="flex min-h-screen">
                            <Sidebar />
                            <div className="flex-1 flex flex-col min-w-0">
                                <Navbar />
                                <main className="flex-1">
                                    {children}
                                </main>
                            </div>
                        </div>
                    </HomeProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
