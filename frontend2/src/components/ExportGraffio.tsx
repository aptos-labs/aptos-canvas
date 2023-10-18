import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { IdentityConnectWallet } from "@identity-connect/wallet-adapter-plugin";
import Link from "next/link";
import { useMemo } from "react";
import { css } from "styled-system/css";

import { useAptosNetworkState } from "@/contexts/wallet";
import { isServer } from "@/utils/isServer";

import { Button } from "./Button";

export const ExportGraffio: React.FC = () => {
  const { connected, wallets, disconnect, account } = useWallet();
  const network = useAptosNetworkState((s) => s.network);
  const icWallet = useMemo(() => {
    if (isServer()) return undefined;
    return wallets.find((w) => w instanceof IdentityConnectWallet) as
      | IdentityConnectWallet
      | undefined;
  }, [wallets]);

  if (!connected) {
    return null;
  } else if (!icWallet?.isDappWallet) {
    return (
      <Link
        target="_blank"
        rel="noopener noreferrer"
        href={`https://explorer.aptoslabs.com/account/${account?.address}/tokens?network=${network}`}
        className={css({ w: "100%" })}
      >
        <Button variant="primary" disabled={!connected} className={css({ w: "100%" })}>
          View Graffio NFT
        </Button>
      </Link>
    );
  }

  return (
    <>
      <Button
        variant="primary"
        className={css({ w: "100%" })}
        onClick={async () => {
          const success = await icWallet.offboardDappWallet();
          if (success) {
            disconnect();
          }
        }}
      >
        Export Graffio Wallet
      </Button>
    </>
  );
};
