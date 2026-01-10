import { create } from 'zustand';

interface WalletData {
    userId: string;
    hbarBalance: string;
    tokenBalance: string;
    accountId: string;
}


export interface PaymentMethod {
    id: string;
    type: string;
    title: string;
    description: string;
    last4: string;
    isDefault?: boolean;
    expiry?: string;
}

interface UserWalletState {
    walletData: WalletData | null;
    paymentMethods: PaymentMethod[];
    isLoading: boolean;
    shareAmount: number;
    setWalletData: (data: WalletData | null) => void;
    setIsLoading: (isLoading: boolean) => void;
    setShareAmount: (amount: number) => void;
    fetchBalance: (reload?: boolean) => Promise<void>;
    fetchPaymentMethods: (reload?: boolean) => Promise<void>;
}

export const useWalletStore = create<UserWalletState>((set, get) => ({
    walletData: null,
    paymentMethods: [],
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
    fetchPaymentMethods: async (reload = false) => {
        if (!reload && get().paymentMethods.length > 0) return;
        // Don't set global isLoading here as it might block other UI
        try {
            const res = await fetch('/api/wallet/cash-out/cash-out-method');
            const data = await res.json();
            // The API returns a single object in data.data, wrap in array if present
            const methods = data.data ? [data.data] : [];
            set({ paymentMethods: methods });
        } catch (error) {
            console.error("Failed to fetch payment methods", error);
        }
    }
}));
