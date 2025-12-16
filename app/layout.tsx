import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthModal } from "@/components/auth/auth-modal";
import { AuthListener } from "@/components/auth/auth-listener";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL("https://livereal.vercel.app"),
    title: {
        default: "LiveReal - NextGen Streaming Platform",
        template: "%s | LiveReal",
    },
    description: "Turn your events into a live experience. Stream your celebration, connect with your audience, and receive gifts in real-time.",
    icons: {
        icon: "/logo.svg",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://livereal.vercel.app",
        siteName: "LiveReal",
        title: "LiveReal - Streaming Platform",
        description: "Stream your event celebration, connect with your audience, and receive gifts in real-time.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "LiveReal - Streaming Platform",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "LiveReal - Streaming Platform",
        description: "Stream your event celebration, connect with your audience, and receive gifts in real-time.",
        images: ["/text-logo.svg"],
    },
};

import { Toaster } from "sonner";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`min-h-screen bg-background text-foreground ${inter.className} antialiased selection:bg-brand-gold selection:text-black`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthListener />
                    {children}
                    <Suspense fallback={null}>
                        <AuthModal />
                    </Suspense>
                    <Toaster theme="system" richColors closeButton />
                </ThemeProvider>
            </body>
        </html>
    );
}
