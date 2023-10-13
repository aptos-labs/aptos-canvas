import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@thalalabs/surf";

import { ABI } from "@/constants/abi";
import { APP_CONFIG } from "@/constants/config";
import { useAptosNetworkState } from "@/contexts/wallet";

export const useIsAdmin = () => {
  const { network } = useAptosNetworkState();
  const { account } = useWallet();

  const { data: isAdmin } = useQuery(
    ["isAdmin"],
    async () => {
      if (!account) return false;
      const client = createClient({
        nodeUrl: APP_CONFIG[network].rpcUrl,
      }).useABI(ABI);
      return (
        await client.view.is_admin({
          type_arguments: [],
          arguments: [APP_CONFIG[network].canvasTokenAddr, account.address as `0x${string}`],
        })
      )[0];
    },
    {
      refetchInterval: 60_000,
    },
  );

  // Return false if isAdmin is undefined
  return !!isAdmin;
};
