'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { EndpointViewer } from './endpoint-viewer';
import { RequestMaker } from './request-maker';

interface ApiDocsProps {
    spec: any;
}

export function ApiDocs({ spec }: ApiDocsProps) {
    const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

    return (
        <div className="flex w-full h-[calc(100vh-64px)] bg-background">
            <Sidebar
                spec={spec}
                selectedEndpoint={selectedEndpoint}
                onSelectEndpoint={setSelectedEndpoint}
            />
            <EndpointViewer
                spec={spec}
                selectedEndpoint={selectedEndpoint}
            />
            <RequestMaker
                spec={spec}
                selectedEndpoint={selectedEndpoint}
            />
        </div>
    );
}
