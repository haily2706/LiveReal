import Link from "next/link";
import { Instagram, Youtube } from "lucide-react";
import { TextLogo } from "@/components/ui/text-logo";

const XIcon = ({ className }: { className?: string }) => (
    <svg role="img" viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
);

export function Footer() {
    return (
        <footer className="border-t border-border/40 py-12">
            <div className="lg:container mx-auto px-4">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    {/* Copyright */}
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2">
                            <TextLogo className="h-4" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} LiveReal. All rights reserved.
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center gap-6">
                        <a
                            href="https://instagram.com/livereal"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground transition-all hover:text-pink-500 hover:scale-110"
                            aria-label="Instagram"
                        >
                            <Instagram className="h-6 w-6" />
                        </a>
                        <a
                            href="https://x.com/livereal"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground transition-all hover:text-foreground hover:scale-110"
                            aria-label="X (formerly Twitter)"
                        >
                            <XIcon className="h-5 w-5" />
                        </a>
                        <a
                            href="https://youtube.com/@livereal"
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
