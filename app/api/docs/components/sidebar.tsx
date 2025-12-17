
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronRight, BookOpen } from 'lucide-react';

interface SidebarProps {
    spec: any;
    selectedEndpoint: string | null;
    onSelectEndpoint: (id: string | null) => void;
}

export function Sidebar({ spec, selectedEndpoint, onSelectEndpoint }: SidebarProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedTags, setExpandedTags] = useState<Record<string, boolean>>({});

    const paths = spec.paths || {};
    const tags: Record<string, any[]> = {};

    // Group paths by tags
    Object.entries(paths).forEach(([path, methods]: [string, any]) => {
        Object.entries(methods).forEach(([method, operation]: [string, any]) => {
            const tag = operation.tags?.[0] || 'General';
            if (!tags[tag]) tags[tag] = [];

            // Filter by search term
            const matchesSearch =
                path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                operation.summary?.toLowerCase().includes(searchTerm.toLowerCase());

            if (matchesSearch) {
                tags[tag].push({
                    id: `${method}-${path}`,
                    method,
                    path,
                    ...operation
                });
            }
        });
    });

    const toggleTag = (tag: string) => {
        setExpandedTags(prev => ({ ...prev, [tag]: !prev[tag] }));
    };

    // Auto-expand all tags on initial load
    useEffect(() => {
        const initialExpanded: Record<string, boolean> = {};
        Object.keys(tags).forEach(t => initialExpanded[t] = true);

        // Only set if we haven't set any yet (to avoid overwriting user collapsed state if they toggle quickly, though for init it's fine)
        // Or just simpler: set it once.
        setExpandedTags(initialExpanded);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    // Auto-expand if searching
    useEffect(() => {
        if (searchTerm) {
            const newExpanded: Record<string, boolean> = {};
            Object.keys(tags).forEach(t => newExpanded[t] = true);
            setExpandedTags(newExpanded);
        }
    }, [searchTerm]);

    const methodColors: Record<string, string> = {
        get: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_-4px_rgba(59,130,246,0.5)] dark:shadow-[0_0_15px_-5px_rgba(59,130,246,0.5)]',
        post: 'text-green-500 bg-green-500/10 border-green-500/20 shadow-[0_0_10px_-4px_rgba(34,197,94,0.5)] dark:shadow-[0_0_15px_-5px_rgba(34,197,94,0.5)]',
        put: 'text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-[0_0_10px_-4px_rgba(249,115,22,0.5)] dark:shadow-[0_0_15px_-5px_rgba(249,115,22,0.5)]',
        delete: 'text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_10px_-4px_rgba(239,68,68,0.5)] dark:shadow-[0_0_15px_-5px_rgba(239,68,68,0.5)]',
        patch: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_10px_-4px_rgba(234,179,8,0.5)] dark:shadow-[0_0_15px_-5px_rgba(234,179,8,0.5)]',
    };

    return (
        <div className="w-80 border-r border-border/50 flex flex-col h-full overflow-hidden bg-background/60 backdrop-blur-xl supports-backdrop-filter:bg-background/40">
            <div className="p-4 border-b border-border/50 bg-background/20">
                <div className="relative group">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
                    <input
                        placeholder="Search endpoints..."
                        className="w-full pl-9 h-9 rounded-xl border border-border/50 bg-secondary/30 px-3 py-1 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:border-purple-500/50 focus-visible:bg-background"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                <button
                    onClick={() => onSelectEndpoint(null)}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 border border-transparent",
                        !selectedEndpoint
                            ? "bg-linear-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20 shadow-xs"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground hover:translate-x-1"
                    )}
                >
                    <div className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        !selectedEndpoint ? "bg-purple-500/20" : "bg-secondary"
                    )}>
                        <BookOpen className="h-4 w-4" />
                    </div>
                    <span>Introduction</span>
                </button>

                {Object.keys(tags).length === 0 && (
                    <div className="text-center text-sm text-muted-foreground mt-10 italic">
                        No endpoints found
                    </div>
                )}

                {Object.entries(tags).map(([tag, endpoints]) => {
                    if (endpoints.length === 0) return null;
                    const isExpanded = expandedTags[tag];

                    return (
                        <div key={tag} className="space-y-1">
                            <button
                                onClick={() => toggleTag(tag)}
                                className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-foreground/80 hover:bg-secondary/40 rounded-lg transition-colors group select-none mt-2"
                            >
                                <span className="group-hover:text-foreground transition-colors">{tag}</span>
                                <ChevronRight className={cn(
                                    "h-4 w-4 text-muted-foreground transition-transform duration-200 opacity-50 group-hover:opacity-100",
                                    isExpanded && "rotate-90"
                                )} />
                            </button>

                            {isExpanded && (
                                <div className="space-y-1 relative ml-3 pl-3 border-l border-border/40">
                                    {endpoints.map((ep) => (
                                        <button
                                            key={ep.id}
                                            onClick={() => onSelectEndpoint(ep.id)}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-3 group relative overflow-hidden border border-transparent",
                                                selectedEndpoint === ep.id
                                                    ? "bg-secondary/80 text-foreground font-medium shadow-xs border-border/50"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                                            )}
                                        >
                                            <span className={cn(
                                                "uppercase font-bold text-[9px] w-12 text-center rounded-md border py-0.5 tracking-wider transition-transform group-hover:scale-105",
                                                methodColors[ep.method]
                                            )}>
                                                {ep.method}
                                            </span>
                                            <span className="truncate flex-1 tracking-tight">
                                                {ep.summary || ep.path}
                                            </span>

                                            {selectedEndpoint === ep.id && (
                                                <div className="absolute left-0 inset-y-0 w-0.5 bg-linear-to-b from-pink-500 to-purple-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
