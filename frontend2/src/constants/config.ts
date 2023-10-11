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
    canvasAddr: "0xbb71ff0f8e8780c0e8a53cf003116ab96dc877394cf2cf4d54e71c1667373146",
    canvasTokenAddr: "0xf1b675e890459dfe0a676c01bd14caca20e35634babccc310b49a14c883ea435",
    canvasImageUrl:
      "https://storage.googleapis.com/images.testnet.graffio.art/images/0xf1b675e890459dfe0a676c01bd14caca20e35634babccc310b49a14c883ea435.png",
    rpcUrl: "https://fullnode.testnet.aptoslabs.com/",
  },
};
