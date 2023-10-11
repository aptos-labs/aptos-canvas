"use client";

import { AptosWalletAdapterProvider, NetworkName, Wallet } from "@aptos-labs/wallet-adapter-react";
import {
  IdentityConnectWallet,
  IdentityConnectWalletConfig,
} from "@identity-connect/wallet-adapter-plugin";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { PontemWallet } from "@pontem/wallet-adapter-plugin";
import { FewchaWallet } from "fewcha-plugin-wallet-adapter";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { create } from "zustand";

import { isServer } from "@/utils/isServer";

const IC_DAPP_ID = process.env.NEXT_PUBLIC_IC_DAPP_ID;

export interface AptosNetworkState {
  network: SupportedNetworkName;
  setNetwork: (network: SupportedNetworkName) => void;
}

export type SupportedNetworkName = NetworkName.Mainnet | NetworkName.Testnet;

export const useAptosNetworkState = create<AptosNetworkState>((set) => ({
  network: isServer()
    ? NetworkName.Mainnet
    : ((window.localStorage.getItem("aptos-network") ??
        NetworkName.Mainnet) as SupportedNetworkName),
  setNetwork: (network) => {
    set({ network });
    window.localStorage.setItem("aptos-network", network);
  },
}));

export function WalletProvider({ children }: React.PropsWithChildren) {
  const network = useAptosNetworkState((s) => s.network);

  const identityConnectWalletConfig: IdentityConnectWalletConfig = {
    networkName: network,
  };

  if (!IC_DAPP_ID) {
    throw new Error("NEXT_PUBLIC_IC_DAPP_ID is not set");
  }

  const wallets: Array<Wallet> = [
    new IdentityConnectWallet(IC_DAPP_ID, identityConnectWalletConfig),
    new PetraWallet(),
    new PontemWallet(),
    new MartianWallet(),
    new FewchaWallet(),
  ];

  return (
    <AptosWalletAdapterProvider key={network} plugins={wallets} autoConnect={true}>
      {children}
    </AptosWalletAdapterProvider>
  );
}
