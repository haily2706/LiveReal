import { createSwaggerSpec } from 'next-swagger-doc';

import Link from 'next/link';

export const getApiDocs = async () => {
    const spec = createSwaggerSpec({
        apiFolder: 'app/api',
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'LiveReal API Documentation',
                version: '1.0',
            },
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'Supabase',
                    },
                },
            },
            security: [
                {
                    BearerAuth: [],
                },
            ],
        },
    });
    return spec;
};

import { ApiDocs } from './components/api-docs';

export default async function IndexPage() {
    const spec = await getApiDocs();
    return (
        <main className="bg-background text-foreground">
            <ApiDocs spec={spec} />
        </main>
    );
}
