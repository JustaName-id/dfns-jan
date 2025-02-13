'use client'

import { JustWeb3Provider, JustWeb3ProviderConfig } from '@justweb3/widget';
import '@justweb3/widget/styles.css';
import {
  getDefaultConfig,
  getDefaultWallets,
  RainbowKitProvider
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import {
  argentWallet,
  ledgerWallet,
  trustWallet
} from '@rainbow-me/rainbowkit/wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { http, WagmiProvider } from 'wagmi';
import { mainnet } from 'wagmi/chains';

interface ProviderProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProviderProps> = (props) => {
  const { wallets } = getDefaultWallets();
  const [queryClient] = useState(() => new QueryClient());


  const config = getDefaultConfig({
    appName: 'Dfns - JustAName',
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,
    wallets: [
      ...wallets,
      {
        groupName: 'Other',
        wallets: [argentWallet, trustWallet, ledgerWallet],
      },
    ],
    chains: [mainnet],
    ssr: true,
    transports: {
      [mainnet.id]: http(
        process.env.NEXT_PUBLIC_MAINNET_PROVIDER_URL as string
      ),
    },
  });

  const justweb3Config: JustWeb3ProviderConfig = {
    config: {
      origin: process.env.NEXT_PUBLIC_ORIGIN as string,
      domain: process.env.NEXT_PUBLIC_DOMAIN as string,
      signInTtl: 1000 * 60 * 60 * 24,
    },
    networks: [
      {
        chainId: 1,
        providerUrl: process.env.NEXT_PUBLIC_MAINNET_PROVIDER_URL as string,
      },
    ],
    enableAuth: true,
    openOnWalletConnect: true,
    allowedEns: 'all',
    disableOverlay: true,
    dev: false,
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <JustWeb3Provider config={justweb3Config}>
          <RainbowKitProvider>{props.children}</RainbowKitProvider>
        </JustWeb3Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
