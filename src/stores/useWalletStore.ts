// Хранилище состояния MetaMask (zustand)

import { create } from 'zustand';

export interface WalletState {
    isMetaMaskAvailable: boolean;
    isMetaMaskUnlocked: boolean;
    isConnected: boolean;
    isCorrectNetwork: boolean;
    account: string | null;
    chainId: number | null;
}

interface WalletStore extends WalletState {
    /**
     * Обновляет частичное состояние кошелька
     */
    setState: (partial: Partial<WalletState>) => void;

    /**
     * Сброс состояния кошелька к начальному (отключение)
     */
    resetState: () => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
    isMetaMaskAvailable: typeof window !== 'undefined' && !!window.ethereum?.isMetaMask,
    isMetaMaskUnlocked: false,
    isConnected: false,
    isCorrectNetwork: false,
    account: null,
    chainId: null,

    setState: (partial) => set(partial),

    resetState: () =>
        set({
            isMetaMaskAvailable: typeof window !== 'undefined' && !!window.ethereum?.isMetaMask,
            isMetaMaskUnlocked: false,
            isConnected: false,
            isCorrectNetwork: false,
            account: null,
            chainId: null,
        }),
}));