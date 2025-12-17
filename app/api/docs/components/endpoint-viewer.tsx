'use client';

import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface EndpointViewerProps {
    spec: any;
    selectedEndpoint: string | null;
}

export function EndpointViewer({ spec, selectedEndpoint }: EndpointViewerProps) {
    const [copied, setCopied] = useState(false);

    if (!selectedEndpoint) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-10 h-full bg-background/50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-linear-to-br from-pink-500/5 via-transparent to-purple-500/5 -z-10" />
                <div className="max-w-md text-center p-8 rounded-2xl border border-border/50 bg-card/50 shadow-xl backdrop-blur-md">
                    <div className="w-16 h-16 mx-auto bg-linear-to-br from-pink-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                        <div className="w-8 h-8 rounded-full bg-linear-to-r from-pink-500 to-purple-500 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Select an Endpoint</h3>
                    <p className="text-muted-foreground">Choose an endpoint from the sidebar to view its documentation and test it out.</p>
                </div>
            </div>
        );
    }

    // Find the operation data
    let operation: any = null;
    let method = '';
    let path = '';

    const paths = spec.paths || {};
    Object.entries(paths).forEach(([p, methods]: [string, any]) => {
        Object.entries(methods).forEach(([m, op]: [string, any]) => {
            if (`${m}-${p}` === selectedEndpoint) {
                operation = op;
                method = m;
                path = p;
            }
        });
    });

    if (!operation) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Copied path to clipboard');
    };

    const methodColors: Record<string, string> = {
        get: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        post: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        put: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
        delete: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
        patch: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    };

    return (
        <div className="flex-1 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-background text-foreground relative">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl -z-10" />

            <div className="max-w-4xl mx-auto p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-6">
                    <span className={cn(
                        "uppercase font-bold text-sm px-3 py-1.5 rounded-lg border shadow-xs",
                        methodColors[method]
                    )}>
                        {method}
                    </span>
                    <h1 className="text-3xl font-bold tracking-tight">{operation.summary || path}</h1>
                </div>

                <div className="group relative flex items-center justify-between gap-4 text-sm font-mono bg-secondary/30 p-4 rounded-xl border border-border/50 mb-8 hover:border-pink-500/20 hover:bg-secondary/50 transition-all">
                    <span className="select-all break-all text-foreground/90">{path}</span>
                    <button
                        onClick={() => copyToClipboard(path)}
                        className="p-2 hover:bg-background rounded-md transition-colors text-muted-foreground hover:text-foreground shrink-0"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>

                {operation.description && (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground mb-10 leading-relaxed">
                        <p>{operation.description}</p>
                    </div>
                )}

                {/* Parameters */}
                {operation.parameters && operation.parameters.length > 0 && (
                    <div className="mb-10">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            Parameters
                            <div className="h-px bg-border flex-1" />
                        </h3>
                        <div className="border border-border/50 rounded-xl overflow-hidden bg-card/30 backdrop-blur-sm shadow-xs">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">In</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {operation.parameters.map((param: any, i: number) => (
                                        <tr key={i} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-primary font-medium">
                                                {param.name}
                                                {param.required && <span className="text-red-500 ml-1" title="Required">*</span>}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium ring-1 ring-inset ring-gray-500/10">
                                                    {param.in}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{param.schema?.type}</td>
                                            <td className="px-6 py-4 text-muted-foreground leading-relaxed">{param.description || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Request Body */}
                {operation.requestBody && (
                    <div className="mb-10">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            Request Body
                            <div className="h-px bg-border flex-1" />
                        </h3>
                        <div className="bg-card/30 backdrop-blur-sm rounded-xl border border-border/50 shadow-xs">
                            {Object.entries(operation.requestBody.content || {}).map(([contentType, content]: [string, any]) => (
                                <div key={contentType}>
                                    <div className="px-4 py-3 border-b border-border/50 flex justify-between items-center">
                                        <span className="text-xs font-medium text-muted-foreground">Content-Type</span>
                                        <span className="text-xs font-mono text-foreground/80 bg-secondary/50 px-2 py-1 rounded">{contentType}</span>
                                    </div>
                                    <div className="p-4 bg-zinc-950/95 dark:bg-zinc-950 rounded-b-xl overflow-hidden">
                                        <pre className="text-xs font-mono text-blue-100 overflow-x-auto min-h-[100px] custom-scrollbar">
                                            {JSON.stringify(content.schema?.example || content.schema, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Responses */}
                <div className="mb-20">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        Responses
                        <div className="h-px bg-border flex-1" />
                    </h3>
                    <div className="space-y-6">
                        {Object.entries(operation.responses || {}).map(([status, response]: [string, any]) => (
                            <div key={status} className="border border-border/50 rounded-xl overflow-hidden bg-card/30 shadow-xs">
                                <div className="px-6 py-4 bg-secondary/30 flex items-center gap-4 border-b border-border/50">
                                    <span className={cn(
                                        "font-mono font-bold text-sm px-2.5 py-0.5 rounded-md border",
                                        status.startsWith('2') ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                            status.startsWith('4') ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
                                                status.startsWith('5') ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                    )}>
                                        {status}
                                    </span>
                                    <span className="text-sm text-foreground/80 font-medium">{response.description}</span>
                                </div>
                                {
                                    response.content && (
                                        <div className="bg-card">
                                            {Object.entries(response.content).map(([contentType, content]: [string, any]) => (
                                                <div key={contentType}>
                                                    {/* <div className="flex items-center justify-between px-4 py-2 bg-secondary/10">
                                                    <span className="text-xs text-muted-foreground font-mono">{contentType}</span>
                                                </div> */}
                                                    <div className="overflow-hidden">
                                                        <pre className="text-xs font-mono bg-zinc-950 text-blue-100 p-6 overflow-x-auto border-t border-border/10">
                                                            {JSON.stringify(content.schema?.example || content.schema, null, 2)}
                                                        </pre>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                }
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div >
    );
}
