'use server';

import { AccessToken } from 'livekit-server-sdk';

export async function getToken(room: string, identity: string, name?: string, role: 'host' | 'viewer' = 'viewer') {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
        throw new Error('Server credentials not set');
    }

    const at = new AccessToken(apiKey, apiSecret, { identity, name });

    at.addGrant({
        room,
        roomJoin: true,
        canPublish: role === 'host',
        canSubscribe: true,
    });

    const token = await at.toJwt();

    return token;
}
