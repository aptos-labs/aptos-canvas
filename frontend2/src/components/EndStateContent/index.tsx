import { useWallet } from "@aptos-labs/wallet-adapter-react";
import Link from "next/link";
import { center, flex } from "styled-system/patterns";

import { DISCORD_CHANNEL } from "@/constants/links";
import { isMintComplete } from "@/contexts/canvas";

import { Button } from "../Button";
import { DiscordIcon } from "../Icons/DiscordIcon";
import { ExportWalletButton } from "./ExportWalletButton";
import { useEndStateToast } from "./useEndStateToast";
import { ViewNftButton } from "./ViewNftButton";

export function EndStateContent() {
  const { connected, wallet, account } = useWallet();
  const isGraffioWallet = Boolean(wallet?.name === "IdentityConnect" && account?.dappWalletId);

  useEndStateToast({ connected, isGraffioWallet });

  if (!connected) {
    return (
      <Button variant="secondary" asChild className={center({ w: "100%" })}>
        <Link
          href={DISCORD_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          className={flex({ gap: 8, align: "center", whiteSpace: "nowrap" })}
        >
          <DiscordIcon />
          Join Discussion
        </Link>
      </Button>
    );
  }

  if (isGraffioWallet) {
    return <ExportWalletButton disabled={!isMintComplete} />;
  }

  return <ViewNftButton disabled={!isMintComplete} />;
}
