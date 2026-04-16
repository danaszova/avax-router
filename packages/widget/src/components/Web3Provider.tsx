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

// Create an error boundary to prevent entire app crashes if RainbowKit CSS fails to load
class RainbowKitErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
    constructor(props: {children: React.ReactNode}) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("RainbowKit Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
                    <h3>Wallet Connection Error</h3>
                    <p>There was a problem loading the wallet connection interface.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

// Public WalletConnect Project ID for demo purposes
// In production, users should pass their own projectId
const projectId = 'b0f69a53d39572b8c9b207ed16a1c1d0';

const connectors = connectorsForWallets(
    [
        {
            groupName: 'Popular',
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
                <RainbowKitErrorBoundary>
                    <RainbowKitProvider
                        theme={theme === 'dark'
                            ? darkTheme({ accentColor: '#E84142', borderRadius: 'large' })
                            : lightTheme({ accentColor: '#E84142', borderRadius: 'large' })
                        }
                    >
                        {children}
                    </RainbowKitProvider>
                </RainbowKitErrorBoundary>
            </QueryClientProvider>
        </WagmiProvider>
    );
};
