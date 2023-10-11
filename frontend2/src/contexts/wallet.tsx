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

// It is okay for this to be publicly accessible.
const IC_DAPP_ID = "a7a31f32-841e-4c5f-90bd-08df7d5175f6";

export interface AptosNetworkState {
  network: NetworkName;
  setNetwork: (network: NetworkName) => void;
}

export const useAptosNetworkState = create<AptosNetworkState>((set) => ({
  network: isServer()
    ? NetworkName.Mainnet
    : ((window.localStorage.getItem("aptos-network") ?? NetworkName.Mainnet) as NetworkName),
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
