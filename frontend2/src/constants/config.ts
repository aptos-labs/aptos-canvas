import { NetworkName } from "@aptos-labs/wallet-adapter-react";

import { SupportedNetworkName } from "@/contexts/wallet";

interface AppConfig {
  canvasAddr: `0x${string}`;
  canvasTokenAddr: `0x${string}`;
  canvasImageUrl: string;
  rpcUrl: string;
}

export const APP_CONFIG: Record<SupportedNetworkName, AppConfig> = {
  [NetworkName.Mainnet]: {
    // TODO: Mainnet
    canvasAddr: "0x",
    canvasTokenAddr: "0x",
    canvasImageUrl: "",
    rpcUrl: "https://fullnode.mainnet.aptoslabs.com/",
  },
  [NetworkName.Testnet]: {
    canvasAddr: "0x6b8169be66d9579ba9ad1192708edcf52de713d3513a431df6cb045f425d3d91",
    canvasTokenAddr: "0x8c654f4be9cefc3a7d0dfa0bda4ee19f75c926763e00f6534f3ab8b5c2ebcdea",
    canvasImageUrl:
      "https://storage.googleapis.com/images.testnet.graffio.art/images/0x8c654f4be9cefc3a7d0dfa0bda4ee19f75c926763e00f6534f3ab8b5c2ebcdea.png",
    rpcUrl: "https://fullnode.testnet.aptoslabs.com/",
  },
};
