import { NetworkName } from "@aptos-labs/wallet-adapter-react";

import { SupportedNetworkName } from "@/contexts/wallet";

interface AppConfig {
  canvasImageUrl: string;
  rpcUrl: string;
}

export const APP_CONFIG: Record<SupportedNetworkName, AppConfig> = {
  [NetworkName.Mainnet]: {
    canvasImageUrl: "",
    rpcUrl: "https://fullnode.mainnet.aptoslabs.com/",
  },
  [NetworkName.Testnet]: {
    canvasImageUrl:
      "https://storage.googleapis.com/images.testnet.graffio.art/images/0xf1b675e890459dfe0a676c01bd14caca20e35634babccc310b49a14c883ea435.png",
    rpcUrl: "https://fullnode.testnet.aptoslabs.com/",
  },
};
