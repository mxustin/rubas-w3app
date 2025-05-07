// Хранилище состояний MetaMask (zustand)

import { create } from 'zustand';

interface WalletState {
    isMetaMaskAvailable: boolean;
    isMetaMaskUnlocked: boolean;
    isConnected: boolean;
    isCorrectNetwork: boolean;
    account: string | null;
    chainId: number | null;
    setState: (partial: Partial<WalletState>) => void;
    reset: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
    isMetaMaskAvailable: typeof window !== 'undefined' && !!window.ethereum?.isMetaMask,
    isMetaMaskUnlocked: false,
    isConnected: false,
    isCorrectNetwork: false,
    account: null,
    chainId: null,
    setState: (partial) => set(partial),
    reset: () =>
        set({
            isMetaMaskUnlocked: false,
            isConnected: false,
            isCorrectNetwork: false,
            account: null,
            chainId: null,
        }),
}));