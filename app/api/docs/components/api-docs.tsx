'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { DocsNavbar } from './docs-navbar';

import { EndpointViewer } from './endpoint-viewer';
import { RequestMaker } from './request-maker';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Play } from 'lucide-react';

interface ApiDocsProps {
    spec: any;
}

export function ApiDocs({ spec }: ApiDocsProps) {
    const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isRequestSheetOpen, setIsRequestSheetOpen] = useState(false);

    return (
        <div className="flex flex-col h-screen bg-background relative overflow-hidden">
            {/* Global background effects so glassmorphism works */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-purple-500/20 via-background to-background z-0 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 z-0 pointer-events-none" />

            {/* Content Content - z-10 to sit above background */}
            <div className="relative z-10 flex flex-col h-full">
                <DocsNavbar
                    mobileNav={
                        <div className="lg:hidden">
                            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="hover:bg-secondary/80">
                                        <Menu className="h-5 w-5" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-80 border-r border-border/50">
                                    <Sidebar
                                        spec={spec}
                                        selectedEndpoint={selectedEndpoint}
                                        onSelectEndpoint={(id) => {
                                            setSelectedEndpoint(id);
                                            setIsMobileMenuOpen(false);
                                        }}
                                    />
                                </SheetContent>
                            </Sheet>
                        </div>
                    }
                    mobileRightNav={
                        selectedEndpoint ? (
                            <div className="xl:hidden">
                                <Sheet open={isRequestSheetOpen} onOpenChange={setIsRequestSheetOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon" className="hover:bg-secondary/80 text-pink-500">
                                            <Play className="h-4 w-4 fill-current" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="right" className="p-0 w-full sm:w-[400px] border-l border-border/50">
                                        <RequestMaker
                                            spec={spec}
                                            selectedEndpoint={selectedEndpoint}
                                        />
                                    </SheetContent>
                                </Sheet>
                            </div>
                        ) : null
                    }
                />

                <div className="flex flex-1 w-full overflow-hidden relative">
                    {/* Desktop Sidebar */}
                    <div className="hidden lg:flex">
                        <Sidebar
                            spec={spec}
                            selectedEndpoint={selectedEndpoint}
                            onSelectEndpoint={setSelectedEndpoint}
                        />
                    </div>

                    <EndpointViewer
                        spec={spec}
                        selectedEndpoint={selectedEndpoint}
                    />

                    {/* Desktop Request Maker */}
                    {/* Desktop Request Maker */}
                    {selectedEndpoint && (
                        <div className="w-[400px] h-full hidden xl:flex xl:flex-col z-10">
                            <RequestMaker
                                spec={spec}
                                selectedEndpoint={selectedEndpoint}
                                className="w-full"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
