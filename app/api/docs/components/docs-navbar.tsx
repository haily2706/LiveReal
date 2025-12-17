'use client';

import Link from 'next/link';
import { TextLogo } from '@/components/ui/text-logo';
import { ModeToggle } from '@/components/theme/mode-toggle';
import { useAuthStore } from '@/components/auth/use-auth-store';
import { useAuthModal } from '@/components/auth/use-auth-modal';
import { UserMenu } from '@/components/auth/user-menu';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function DocsNavbar() {
    const { user, isLoading } = useAuthStore();
    const { onOpen } = useAuthModal();

    return (
        <nav className="sticky top-0 z-50 w-full h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto h-full px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <TextLogo />
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                        Home
                    </Link>

                    <div className="h-6 w-px bg-border/50 hidden sm:block" />

                    <ModeToggle />

                    {isLoading ? (
                        <div className="h-9 w-9 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    ) : user ? (
                        <UserMenu email={user.email} />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onOpen('sign_in')}
                                className="hidden sm:inline-flex hover:text-pink-500 hover:bg-pink-500/10"
                            >
                                Sign In
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => onOpen('sign_up')}
                                className="bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-pink-500/20"
                            >
                                Sign Up
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
