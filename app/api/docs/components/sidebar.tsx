'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';

interface SidebarProps {
    spec: any;
    selectedEndpoint: string | null;
    onSelectEndpoint: (id: string) => void;
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
        get: 'text-blue-500 bg-blue-500/10 border-blue-200 dark:border-blue-900',
        post: 'text-green-500 bg-green-500/10 border-green-200 dark:border-green-900',
        put: 'text-orange-500 bg-orange-500/10 border-orange-200 dark:border-orange-900',
        delete: 'text-red-500 bg-red-500/10 border-red-200 dark:border-red-900',
        patch: 'text-yellow-500 bg-yellow-500/10 border-yellow-200 dark:border-yellow-900',
    };

    return (
        <div className="w-80 border-r border-border/50 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background/50 backdrop-blur-xl">
            <div className="p-4 border-b border-border/50">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        placeholder="Search endpoints..."
                        className="w-full pl-9 h-9 rounded-md border border-input bg-secondary/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {Object.keys(tags).length === 0 && (
                    <div className="text-center text-sm text-muted-foreground mt-10">
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
                                className="w-full flex items-center justify-between px-2 py-2 text-sm font-semibold text-foreground hover:bg-secondary/50 rounded-md transition-colors group"
                            >
                                <span>{tag}</span>
                                <ChevronRight className={cn(
                                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                    isExpanded && "rotate-90"
                                )} />
                            </button>

                            {isExpanded && (
                                <div className="space-y-1 ml-2 pl-2 border-l border-border/50">
                                    {endpoints.map((ep) => (
                                        <button
                                            key={ep.id}
                                            onClick={() => onSelectEndpoint(ep.id)}
                                            className={cn(
                                                "w-full text-left px-2 py-1.5 rounded-md text-xs transition-all flex items-center gap-2 group relative overflow-hidden",
                                                selectedEndpoint === ep.id
                                                    ? "bg-secondary text-foreground font-medium"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                            )}
                                        >

                                            {selectedEndpoint === ep.id && (
                                                <div className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-pink-500 to-purple-500 rounded-r-full" />
                                            )}

                                            <span className={cn(
                                                "uppercase font-bold text-[9px] w-10 text-center rounded border px-0.5 py-0.5",
                                                methodColors[ep.method]
                                            )}>
                                                {ep.method}
                                            </span>
                                            <span className="truncate flex-1">
                                                {ep.summary || ep.path}
                                            </span>
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
