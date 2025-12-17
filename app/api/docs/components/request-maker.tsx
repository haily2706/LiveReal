'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Play, Loader2, Trash2, Code2 } from 'lucide-react';
import { toast } from 'sonner';

interface RequestMakerProps {
    spec: any;
    selectedEndpoint: string | null;
    className?: string; // Add className prop
}

export function RequestMaker({ spec, selectedEndpoint, className }: RequestMakerProps) {
    const [params, setParams] = useState<Record<string, string>>({});
    const [body, setBody] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);

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

    useEffect(() => {
        setParams({});
        setBody('');
        setResponse(null);

        if (operation?.requestBody?.content?.['application/json']?.schema?.example) {
            setBody(JSON.stringify(operation.requestBody.content['application/json'].schema.example, null, 2));
        }
    }, [selectedEndpoint]);


    if (!selectedEndpoint || !operation) {
        return null;
    }

    const handleSend = async () => {
        setIsLoading(true);
        setResponse(null);

        try {
            // Replace path params
            let finalPath = path;
            Object.entries(params).forEach(([key, value]) => {
                finalPath = finalPath.replace(`{${key}}`, value);
            });

            // Prepare query params
            const queryParams = new URLSearchParams();
            operation.parameters?.forEach((param: any) => {
                if (param.in === 'query' && params[param.name]) {
                    queryParams.append(param.name, params[param.name]);
                }
            });
            const queryString = queryParams.toString();
            const url = `${finalPath}${queryString ? `?${queryString}` : ''}`;

            // Make request
            const res = await axios({
                method,
                url,
                data: body ? JSON.parse(body) : undefined,
                validateStatus: () => true, // resolve promise for all status codes
            });

            setResponse({
                status: res.status,
                statusText: res.statusText,
                data: res.data,
                headers: res.headers,
            });
            toast.success(`Request finished with status ${res.status}`);

        } catch (error: any) {
            console.error('Request failed', error);
            setResponse({
                error: true,
                message: error.message
            });
            toast.error('Request failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn(
            "flex flex-col h-full bg-background/60 backdrop-blur-xl border-l border-border/50 shadow-2xl supports-backdrop-filter:bg-background/40",
            className
        )}>
            {/* Header */}
            <div className="flex-none px-6 py-4 border-b border-border/50 bg-background/40 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-base flex items-center gap-2">
                        <span className="bg-pink-500/10 p-1.5 rounded-md">
                            <Code2 className="w-4 h-4 text-pink-500" />
                        </span>
                        Try it out
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Test this endpoint live</p>
                </div>
                <button
                    onClick={() => { setParams({}); setBody(''); setResponse(null); }}
                    className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1.5 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 font-medium"
                    title="Clear all fields"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                {/* Parameters Section */}
                {operation.parameters && operation.parameters.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Parameters
                            </h4>
                            <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground border border-border/50">
                                {operation.parameters.length} fields
                            </span>
                        </div>

                        <div className="space-y-3">
                            {operation.parameters.map((param: any, i: number) => (
                                <div key={i} className="group relative">
                                    <label className="absolute left-3 -top-2 px-1 bg-background/90 text-[10px] font-bold text-muted-foreground/80 group-focus-within:text-purple-500 transition-colors z-10 flex items-center gap-1">
                                        {param.name}
                                        {param.required && <span className="text-red-500 text-xs">*</span>}
                                    </label>
                                    <input
                                        className="w-full text-xs px-4 py-3 rounded-xl border border-input bg-background/50 hover:bg-background/80 focus:bg-background transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50"
                                        placeholder={param.description ? `e.g. ${param.description}` : `Enter ${param.name}`}
                                        value={params[param.name] || ''}
                                        onChange={(e) => setParams(prev => ({ ...prev, [param.name]: e.target.value }))}
                                    />
                                    <span className="absolute right-3 top-3 text-[10px] text-muted-foreground/50 font-mono uppercase">
                                        {param.in}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Body Editor Section */}
                {['post', 'put', 'patch'].includes(method) && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Request Body
                            </h4>
                            <span className="text-[10px] font-mono text-muted-foreground">JSON</span>
                        </div>
                        <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-sm focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500/50 transition-all">
                            <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-pink-500/50 to-purple-500/50 opacity-0 focus-within:opacity-100 transition-opacity" />
                            <textarea
                                className="w-full h-[250px] text-xs font-mono px-4 py-3 bg-zinc-950 text-blue-100 focus:outline-none resize-y leading-relaxed custom-scrollbar placeholder:text-zinc-700"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="{}"
                                spellCheck={false}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Response Section (Collapsible/Overlay or Bottom Panel) */}
            {response && (
                <div className="flex-none max-h-[40%] min-h-[200px] border-t border-border/50 flex flex-col bg-background/95 backdrop-blur-xl animate-in slide-in-from-bottom-10 duration-300 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10 relative">
                    {/* Resize Handle (Visual) */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 cursor-grab active:cursor-grabbing transition-colors" />

                    <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between bg-secondary/20">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Response</span>
                        {response.status && (
                            <div className={cn(
                                "flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                                response.status >= 200 && response.status < 300
                                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                                    : "bg-red-500/10 text-red-600 border-red-500/20"
                            )}>
                                <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse",
                                    response.status >= 200 && response.status < 300 ? "bg-green-500" : "bg-red-500"
                                )} />
                                {response.status} {response.statusText}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-auto bg-[#0d1117] p-0 custom-scrollbar relative group">
                        <div className="absolute top-3 right-3 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Optional: Add Copy JSON button here later */}
                        </div>
                        <pre className="text-[11px] font-mono text-green-300 leading-relaxed p-4">
                            {JSON.stringify(response.data || response, null, 2)}
                        </pre>
                    </div>
                </div>
            )}

            {/* Footer / Send Button */}
            <div className="p-6 border-t border-border/50 bg-background/40 backdrop-blur-sm z-20">
                <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="group relative w-full h-12 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl flex items-center justify-center gap-3 text-sm font-bold transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-linear-to-r from-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <span className="relative flex items-center gap-2 z-10 group-hover:text-white">
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Play className="w-4 h-4 fill-current" />
                        )}
                        {isLoading ? 'Sending Request...' : 'Send Request'}
                    </span>
                </button>
            </div>
        </div>
    );
}
