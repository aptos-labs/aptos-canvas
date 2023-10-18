import { createClient } from "@thalalabs/surf";
import { useEffect } from "react";

import { ABI } from "@/constants/abi";
import { APP_CONFIG } from "@/constants/config";
import { useCanvasState } from "@/contexts/canvas";
import { useAptosNetworkState } from "@/contexts/wallet";

export function useCanDrawUnlimited(address: string | undefined) {
  const { network } = useAptosNetworkState();

  useEffect(() => {
    if (!address) return;

    const canvasModuleAddress = APP_CONFIG[network].canvasAddr;
    const abi = ABI(canvasModuleAddress);
    const client = createClient({ nodeUrl: APP_CONFIG[network].rpcUrl }).useABI(abi);

    const fetchCanDrawUnlimited = async () => {
      const canDrawUnlimited = (
        await client.view.can_draw_unlimited({
          type_arguments: [],
          arguments: [APP_CONFIG[network].canvasTokenAddr, address as `0x${string}`],
        })
      )[0];

      useCanvasState.setState({ canDrawUnlimited });
    };

    fetchCanDrawUnlimited().catch((e) => {
      console.error("Failed to fetch admin status", e);
    });
  }, [address, network]);
}
