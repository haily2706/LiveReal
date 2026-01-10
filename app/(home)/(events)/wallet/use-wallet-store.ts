import { create } from 'zustand';

interface WalletData {
    userId: string;
    hbarBalance: string;
    tokenBalance: string;
    accountId: string;
}

interface UserWalletState {
    walletData: WalletData | null;
    isLoading: boolean;
    shareAmount: number;
    setWalletData: (data: WalletData | null) => void;
    setIsLoading: (isLoading: boolean) => void;
    setShareAmount: (amount: number) => void;
    fetchBalance: (reload?: boolean) => Promise<void>;
}

export const useWalletStore = create<UserWalletState>((set, get) => ({
    walletData: null,
    isLoading: false,
    shareAmount: 0,
    setWalletData: (data) => set({ walletData: data }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setShareAmount: (amount) => set({ shareAmount: amount }),
    fetchBalance: async (reload = false) => {
        if (!reload && get().walletData) return;
        set({ isLoading: true });
        try {
            const response = await fetch("/api/wallet/balance");
            if (response.ok) {
                const data = await response.json();
                set({ walletData: data });
            }
        } catch (error) {
            console.error("Failed to fetch balance", error);
        } finally {
            set({ isLoading: false });
        }
    },
}));
