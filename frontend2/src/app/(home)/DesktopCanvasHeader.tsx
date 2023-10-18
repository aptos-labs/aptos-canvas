import Link from "next/link";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

import { ConnectWalletButton } from "@/components/ConnectWalletModal";
import { Countdown } from "@/components/Countdown";
import { AptosIcon } from "@/components/Icons/AptosIcon";
import { DiscordIcon } from "@/components/Icons/DiscordIcon";
import { NetworkSelector } from "@/components/NetworkSelector";
import { DISCORD_CHANNEL } from "@/constants/links";

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
      <div className={flex({ gap: 24, align: "center" })}>
        <Link
          href={DISCORD_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          className={flex({
            gap: 8,
            align: "center",
            textStyle: "body.md.regular",
            color: "interactive.primary",
          })}
        >
          <DiscordIcon />
          Join Discussion
        </Link>
        <ConnectWalletButton />
        {process.env.GRAFFIO_ENV !== "production" && <NetworkSelector />}
      </div>
    </div>
  );
}
