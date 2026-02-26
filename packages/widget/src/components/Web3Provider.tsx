import React from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
    RainbowKitProvider,
    darkTheme,
    lightTheme,
    connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import {
    injectedWallet,
    metaMaskWallet,
    rainbowWallet,
    walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, WagmiProvider, http } from 'wagmi';
import { avalanche } from 'wagmi/chains';
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";

const projectId = 'YOUR_PROJECT_ID'; // Use a real ID for WalletConnect support

const connectors = connectorsForWallets(
    [
        {
            groupName: 'Recommended',
            wallets: [
                injectedWallet,
                metaMaskWallet,
                rainbowWallet,
                walletConnectWallet,
            ],
        },
    ],
    {
        appName: 'Avalanche DEX Router',
        projectId,
    }
);

const config = createConfig({
    connectors,
    chains: [avalanche],
    transports: {
        [avalanche.id]: http(),
    },
});

const queryClient = new QueryClient();

export const Web3Provider: React.FC<{ children: React.ReactNode, theme?: 'light' | 'dark' }> = ({
    children,
    theme = 'dark'
}) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={theme === 'dark'
                        ? darkTheme({ accentColor: '#E84142', borderRadius: 'large' })
                        : lightTheme({ accentColor: '#E84142', borderRadius: 'large' })
                    }
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};
