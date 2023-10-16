import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

import { ConnectWalletButton } from "@/components/ConnectWalletModal";
import { Countdown } from "@/components/Countdown";
import { AptosIcon } from "@/components/Icons/AptosIcon";
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
        <AptosIcon className={css({ color: "brand.logo" })} />
        <Countdown />
      </div>
      <div className={flex({ gap: 16, align: "center" })}>
        <ConnectWalletButton />
        <NetworkSelector />
      </div>
    </div>
  );
}
