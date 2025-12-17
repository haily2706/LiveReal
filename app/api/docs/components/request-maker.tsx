'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Play, Loader2, Trash2, Code2 } from 'lucide-react';
import { toast } from 'sonner';

interface RequestMakerProps {
    spec: any;
    selectedEndpoint: string | null;
}

export function RequestMaker({ spec, selectedEndpoint }: RequestMakerProps) {
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
        return (
            <div className="w-[400px] border-l border-border/50 bg-secondary/5 h-[calc(100vh-64px)] hidden xl:flex flex-col items-center justify-center text-muted-foreground backdrop-blur-sm">
                <Code2 className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-medium">Ready to test requests</p>
            </div>
        );
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
        <div className="w-[400px] border-l border-border/50 bg-background/50 backdrop-blur-sm h-[calc(100vh-64px)] hidden xl:flex xl:flex-col shadow-2xl z-10">
            <div className="p-4 border-b border-border/50 bg-card/50 flex items-center justify-between backdrop-blur-sm">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-pink-500" />
                    Request Maker
                </h3>
                <button
                    onClick={() => { setParams({}); setBody(''); setResponse(null); }}
                    className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
                >
                    <Trash2 className="w-3 h-3" /> Clear
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">

                {/* Parameters Form */}
                {operation.parameters && operation.parameters.length > 0 && (
                    <div className="space-y-4">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            Parameters
                            <div className="h-px bg-border flex-1" />
                        </div>
                        {operation.parameters.map((param: any, i: number) => (
                            <div key={i} className="space-y-1.5">
                                <label className="text-xs font-medium flex items-center gap-1 text-foreground/90">
                                    {param.name}
                                    {param.required && <span className="text-red-500" title="Required">*</span>}
                                    <span className="text-[10px] text-muted-foreground font-normal ml-auto uppercase bg-secondary px-1.5 py-0.5 rounded border border-border/50">{param.in}</span>
                                </label>
                                <input
                                    className="w-full text-xs px-3 py-2 rounded-md border border-input bg-secondary/20 focus:bg-background transition-colors focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                                    placeholder={param.description || `value`}
                                    value={params[param.name] || ''}
                                    onChange={(e) => setParams(prev => ({ ...prev, [param.name]: e.target.value }))}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Body Editor */}
                {['post', 'put', 'patch'].includes(method) && (
                    <div className="space-y-4">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            Body (JSON)
                            <div className="h-px bg-border flex-1" />
                        </div>
                        <textarea
                            className="w-full h-[200px] text-xs font-mono px-4 py-3 rounded-lg border border-input bg-zinc-950 text-blue-100 focus:outline-none focus:ring-1 focus:ring-ring resize-y leading-relaxed custom-scrollbar"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="{}"
                            spellCheck={false}
                        />
                    </div>
                )}
            </div>

            {/* Footer / Send Button */}
            <div className="p-4 border-t border-border/50 bg-card/50">
                <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="w-full bg-linear-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white h-10 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all shadow-lg shadow-pink-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                    Send Request
                </button>
            </div>

            {/* Response Preview Panel */}
            {response && (
                <div className="h-1/2 border-t border-border/50 flex flex-col animate-in slide-in-from-bottom-10 duration-300">
                    <div className="px-4 py-2 bg-secondary/50 border-b border-border/50 flex items-center justify-between backdrop-blur-sm">
                        <span className="text-xs font-semibold text-muted-foreground">Response</span>
                        {response.status && (
                            <span className={cn(
                                "text-xs font-mono font-bold px-2 py-0.5 rounded-md border shadow-xs",
                                response.status >= 200 && response.status < 300
                                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                                    : "bg-red-500/10 text-red-600 border-red-500/20"
                            )}>
                                {response.status} {response.statusText}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 overflow-auto bg-zinc-950 p-4 custom-scrollbar">
                        <pre className="text-[10px] font-mono text-blue-100 leading-relaxed">
                            {JSON.stringify(response.data || response, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
