import { createClient } from "@thalalabs/surf";
import { useEffect } from "react";

import { ABI } from "@/constants/abi";
import { APP_CONFIG } from "@/constants/config";
import { useCanvasState } from "@/contexts/canvas";
import { useAptosNetworkState } from "@/contexts/wallet";

export function useIsAdmin(address: string | undefined) {
  const { network } = useAptosNetworkState();

  useEffect(() => {
    if (!address) return;

    const client = createClient({ nodeUrl: APP_CONFIG[network].rpcUrl }).useABI(ABI);

    const fetchIsAdmin = async () => {
      const isAdmin = (
        await client.view.is_admin({
          type_arguments: [],
          arguments: [APP_CONFIG[network].canvasTokenAddr, address as `0x${string}`],
        })
      )[0];

      useCanvasState.setState({ isAdmin });
    };

    fetchIsAdmin().catch((e) => {
      console.error("Failed to fetch admin status", e);
    });
  }, [address, network]);
}
