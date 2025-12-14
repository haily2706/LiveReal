import Link from "next/link";
import { Instagram, Twitter, Youtube } from "lucide-react";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="border-t border-border/40 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    {/* Copyright */}
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/text-logo.svg"
                                alt="LiveReal Logo"
                                width={160}
                                height={20}
                                className="w-auto h-12 hover:opacity-80 transition-opacity"
                                priority
                            />
                        </div>
                        <p className="text-sm text-muted-foreground pl-2">
                            © {new Date().getFullYear()} LiveReal. All rights reserved.
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center gap-6">
                        <a
                            href="https://instagram.com/ireal"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground transition-all hover:text-pink-500 hover:scale-110"
                            aria-label="Instagram"
                        >
                            <Instagram className="h-6 w-6" />
                        </a>
                        <a
                            href="https://x.com/ireal"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground transition-all hover:text-blue-400 hover:scale-110"
                            aria-label="Twitter"
                        >
                            <Twitter className="h-6 w-6" />
                        </a>
                        <a
                            href="https://youtube.com/@ireal"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground transition-all hover:text-red-500 hover:scale-110"
                            aria-label="YouTube"
                        >
                            <Youtube className="h-6 w-6" />
                        </a>
                    </div>

                    {/* Legal Links */}
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <Link
                            href="/privacy"
                            className="transition-colors hover:text-foreground hover:underline"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="transition-colors hover:text-foreground hover:underline"
                        >
                            Terms
                        </Link>
                        <Link
                            href="/support"
                            className="transition-colors hover:text-foreground hover:underline"
                        >
                            Support
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
