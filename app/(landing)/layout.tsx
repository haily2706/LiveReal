import type { Metadata } from "next";
import { Navbar } from "./components/navbar";
import "../globals.css";
import { ThemeProvider } from "@/app/components/theme-provider";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  metadataBase: new URL("https://ireal.live"),
  title: {
    default: "iReal - Birthday Streaming Platform",
    template: "%s | iReal",
  },
  description: "Turn your birthday into a live experience. Stream your celebration, connect with your audience, and receive gifts in real-time.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ireal.live",
    siteName: "iReal",
    title: "iReal - Birthday Streaming Platform",
    description: "Stream your birthday celebration, connect with your audience, and receive gifts in real-time.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "iReal - Birthday Streaming Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "iReal - Birthday Streaming Platform",
    description: "Stream your birthday, receive gifts, and connect with your audience live.",
    images: ["/og-image.png"],
  },
};

const outfit = Inter({ subsets: ["latin"] });

export default function RootLayout({
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
          <Navbar />
          <main className="flex w-full flex-1 flex-col">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

