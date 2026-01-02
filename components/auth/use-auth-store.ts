import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setIsLoading: (isLoading: boolean) => void;
    getDisplayName: () => string;
    getAvatarUrl: () => string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user }),
    setIsLoading: (isLoading) => set({ isLoading }),
    getDisplayName: () => {
        const user = get().user;
        if (!user) return "";
        return (
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Anonymous"
        );
    },
    getAvatarUrl: () => {
        const user = get().user;
        if (!user) return "";
        return user.user_metadata?.avatar_url || user.user_metadata?.picture || "";
    },
}));
