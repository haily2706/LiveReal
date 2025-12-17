'use client';

import { cn } from '@/lib/utils';
import { Copy, Check, Shield, Server, Terminal, Zap } from 'lucide-react';
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
            <div className="flex-1 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-transparent text-foreground relative scroll-smooth">
                {/* Decorative Background - kept but subtle */}
                {/* <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10" /> */}
                {/* <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl -z-10" /> */}

                <div className="max-w-4xl mx-auto p-8 lg:p-12 space-y-12">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50 text-xs font-medium text-muted-foreground backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            API v1.0 Live
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500 pb-2 drop-shadow-sm">
                            LiveReal API Documentation
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                            Welcome to the developer hub. Integrate LiveReal's streaming capabilities, manage wallets, and build powerful real-time experiences directly into your applications.
                        </p>
                    </div>

                    {/* Quick Start Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md hover:bg-card/60 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10 group">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                                <Shield className="w-5 h-5 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-500 transition-colors">Authentication</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Secure access using Bearer tokens. Include your API key in the header of every request.
                            </p>
                            <div className="bg-zinc-950/80 rounded-lg p-3 border border-border/10 group relative overflow-hidden">
                                <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <code className="text-xs font-mono text-blue-100 block relative z-10">Authorization: Bearer &lt;token&gt;</code>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md hover:bg-card/60 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-pink-500/10 group">
                            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition-colors">
                                <Server className="w-5 h-5 text-pink-500" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-pink-500 transition-colors">Base URL</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                All API endpoints are relative to the base URL.
                            </p>
                            <div className="bg-zinc-950/80 rounded-lg p-3 border border-border/10 relative overflow-hidden">
                                <div className="absolute inset-0 bg-linear-to-r from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <code className="text-xs font-mono text-purple-100 block relative z-10">https://livereal.vercel.app/api</code>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Core Capabilities</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 backdrop-blur-sm hover:bg-secondary/50 transition-colors">
                                <Zap className="w-6 h-6 text-yellow-500 mb-3" />
                                <h3 className="font-semibold mb-2">Real-time Payments</h3>
                                <p className="text-sm text-muted-foreground">Instant crypto transactions via Hedera and Stripe integrations.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 backdrop-blur-sm hover:bg-secondary/50 transition-colors">
                                <Terminal className="w-6 h-6 text-purple-500 mb-3" />
                                <h3 className="font-semibold mb-2">Wallet Management</h3>
                                <p className="text-sm text-muted-foreground">Full control over user balances, transaction history, and asset transfers.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 backdrop-blur-sm hover:bg-secondary/50 transition-colors">
                                <Server className="w-6 h-6 text-green-500 mb-3" />
                                <h3 className="font-semibold mb-2">User Data</h3>
                                <p className="text-sm text-muted-foreground">Securely manage user profiles, preferences, and authentication states.</p>
                            </div>
                        </div>
                    </div>
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

    // Method colors with enhanced glows
    const methodColors: Record<string, string> = {
        get: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)] dark:shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)]',
        post: 'text-green-500 bg-green-500/10 border-green-500/20 shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)] dark:shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)]',
        put: 'text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-[0_0_15px_-3px_rgba(249,115,22,0.3)] dark:shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)]',
        delete: 'text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)] dark:shadow-[0_0_20px_-5px_rgba(239,68,68,0.4)]',
        patch: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_15px_-3px_rgba(234,179,8,0.3)] dark:shadow-[0_0_20px_-5px_rgba(234,179,8,0.4)]',
    };

    return (
        <div className="flex-1 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar bg-transparent text-foreground relative scroll-smooth">
            <div className="max-w-5xl mx-auto p-8 lg:p-12">

                {/* Header Section */}
                <div className="flex flex-col gap-6 mb-10 border-b border-border/40 pb-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className={cn(
                                "uppercase font-bold text-base px-4 py-2 rounded-xl transition-all hover:scale-105 select-none",
                                methodColors[method]
                            )}>
                                {method}
                            </span>
                            <span className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                                {operation.summary || path}
                            </span>
                        </div>
                    </div>

                    <div className="group relative flex items-center justify-between gap-4 font-mono text-sm bg-zinc-950/5 dark:bg-white/5 p-1 rounded-xl border border-border/50 shadow-inner hover:border-pink-500/30 transition-all duration-300">
                        <div className="flex items-center gap-3 px-4 py-3 flex-1 overflow-hidden">
                            <span className="text-muted-foreground select-none">$</span>
                            <span className="select-all break-all text-foreground/90 font-medium">{path}</span>
                        </div>
                        <button
                            onClick={() => copyToClipboard(path)}
                            className="p-2.5 m-1 hover:bg-background/80 hover:shadow-xs rounded-lg transition-all text-muted-foreground hover:text-foreground shrink-0 active:scale-95"
                            title="Copy URL"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>

                    {operation.description && (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground/90 leading-relaxed bg-secondary/20 p-6 rounded-2xl border border-border/30">
                            <p>{operation.description}</p>
                        </div>
                    )}
                </div>


                {/* Parameters */}
                {operation.parameters && operation.parameters.length > 0 && (
                    <div className="mb-12">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                            <span className="bg-purple-500/10 text-purple-600 p-2 rounded-lg">
                                <Terminal className="w-5 h-5" />
                            </span>
                            Parameters
                        </h3>
                        <div className="border border-border/50 rounded-2xl overflow-hidden bg-card/40 backdrop-blur-sm shadow-xs">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold border-b border-border/50">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">In</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {operation.parameters.map((param: any, i: number) => (
                                        <tr key={i} className="hover:bg-secondary/20 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-foreground font-medium ">
                                                {param.name}
                                                {param.required && <span className="text-red-500 ml-1.5 text-xs font-bold" title="Required">*</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-md bg-secondary/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border/50">
                                                    {param.in}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-purple-500/80">{param.schema?.type}</td>
                                            <td className="px-6 py-4 text-muted-foreground/80 leading-relaxed group-hover:text-foreground transition-colors">{param.description || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Request Body */}
                {operation.requestBody && (
                    <div className="mb-12">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                            <span className="bg-blue-500/10 text-blue-600 p-2 rounded-lg">
                                <Server className="w-5 h-5" />
                            </span>
                            Request Body
                        </h3>
                        <div className="bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 shadow-xs overflow-hidden">
                            {Object.entries(operation.requestBody.content || {}).map(([contentType, content]: [string, any]) => (
                                <div key={contentType}>
                                    <div className="px-5 py-3 border-b border-border/50 flex justify-between items-center bg-secondary/30">
                                        <span className="text-xs font-medium text-muted-foreground">Content-Type</span>
                                        <span className="text-xs font-mono text-foreground/80 bg-background/80 px-2 py-1 rounded shadow-sm border border-border/30">{contentType}</span>
                                    </div>
                                    <div className="relative group">
                                        {/* Mac Window Controls */}
                                        <div className="absolute top-4 left-4 flex gap-1.5 z-10">
                                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
                                        </div>
                                        <div className="p-4 pt-10 bg-zinc-950/95 dark:bg-[#0d1117] overflow-hidden">
                                            <pre className="text-xs font-mono text-blue-300 overflow-x-auto min-h-[100px] custom-scrollbar selection:bg-blue-500/30">
                                                {JSON.stringify(content.schema?.example || content.schema, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Responses */}
                <div className="mb-20">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                        <span className="bg-green-500/10 text-green-600 p-2 rounded-lg">
                            <Zap className="w-5 h-5" />
                        </span>
                        Responses
                    </h3>
                    <div className="space-y-6">
                        {Object.entries(operation.responses || {}).map(([status, response]: [string, any]) => (
                            <div key={status} className="border border-border/50 rounded-2xl overflow-hidden bg-card/40 shadow-xs group hover:border-border/80 transition-all">
                                <div className="px-6 py-4 bg-secondary/30 flex items-center gap-4 border-b border-border/50">
                                    <span className={cn(
                                        "font-mono font-bold text-sm px-3 py-1 rounded-lg border shadow-xs",
                                        status.startsWith('2') ? "bg-green-500/10 text-green-600 border-green-500/20 shadow-green-500/10" :
                                            status.startsWith('4') ? "bg-orange-500/10 text-orange-600 border-orange-500/20 shadow-orange-500/10" :
                                                status.startsWith('5') ? "bg-red-500/10 text-red-600 border-red-500/20 shadow-red-500/10" : "bg-blue-500/10 text-blue-600 border-blue-500/20 shadow-blue-500/10"
                                    )}>
                                        {status}
                                    </span>
                                    <span className="text-sm text-foreground font-medium">{response.description}</span>
                                </div>
                                {
                                    response.content && (
                                        <div className="bg-card">
                                            {Object.entries(response.content).map(([contentType, content]: [string, any]) => (
                                                <div key={contentType} className="relative">
                                                    <div className="absolute top-4 left-4 flex gap-1.5 z-10">
                                                        <div className="w-3 h-3 rounded-full bg-zinc-700/50" />
                                                        <div className="w-3 h-3 rounded-full bg-zinc-700/50" />
                                                        <div className="w-3 h-3 rounded-full bg-zinc-700/50" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <pre className="text-xs font-mono bg-[#0d1117] text-green-300 p-6 pt-10 overflow-x-auto selection:bg-green-500/30">
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
