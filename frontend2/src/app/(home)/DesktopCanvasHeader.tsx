import Image from "next/image";
import { flex } from "styled-system/patterns";

import { ConnectWalletButton } from "@/components/ConnectWalletModal";
import { Countdown } from "@/components/Countdown";
import { NetworkSelector } from "@/components/NetworkSelector";

export function DesktopCanvasHeader() {
  return (
    <div
      className={flex({
        display: "none",
        md: { display: "flex" },
        gap: 16,
        justify: "space-between",
        align: "center",
      })}
    >
      <div className={flex({ gap: 16, align: "center" })}>
        <Image src="/images/aptos-logo.svg" alt="Aptos Logo" height={32} width={32} />
        <Countdown />
      </div>
      <div className={flex({ gap: 16, align: "center" })}>
        <ConnectWalletButton />
        <NetworkSelector />
      </div>
    </div>
  );
}
