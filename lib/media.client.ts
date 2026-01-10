import { createClient, SupabaseClient } from "@supabase/supabase-js";

class MediaClient {

    private client: SupabaseClient | null = null;

    constructor() {
        this.client = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
    }

    getAvatarUrl(userId?: string, avatar: boolean = true) {
        if (!userId || !avatar) return undefined;
        if (userId.startsWith('guest-')) return undefined;

        const id = userId.split("-viewer-")[0].split(" (via OBS")[0];

        const { data: { publicUrl } } = this.client!.storage
            .from('avatars')
            .getPublicUrl(id);

        return publicUrl;
    }

}

export const mediaClient = new MediaClient();