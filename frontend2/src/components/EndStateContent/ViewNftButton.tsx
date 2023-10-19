import { useWallet } from "@aptos-labs/wallet-adapter-react";
import Link from "next/link";
import { css } from "styled-system/css";
import { center } from "styled-system/patterns";

import { useAptosNetworkState } from "@/contexts/wallet";

import { Button } from "../Button";

export interface ViewNftButton {
  disabled?: boolean;
}

export function ViewNftButton({ disabled }: ViewNftButton) {
  const { account } = useWallet();
  const network = useAptosNetworkState((s) => s.network);

  const buttonText = `View Graffio NFT${disabled ? " (Coming Soon)" : ""}`;

  if (disabled) {
    return (
      <Button disabled className={css({ w: "100%" })}>
        {buttonText}
      </Button>
    );
  }

  return (
    <Button asChild className={center({ w: "100%" })}>
      <Link
        target="_blank"
        rel="noopener noreferrer"
        href={`https://explorer.aptoslabs.com/account/${account?.address}/tokens?network=${network}`}
      >
        {buttonText}
      </Link>
    </Button>
  );
}
