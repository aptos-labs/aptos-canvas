import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

import { ConnectWalletButton } from "@/components/ConnectWalletModal";
import { AptosIcon } from "@/components/Icons/AptosIcon";
import { NetworkSelector } from "@/components/NetworkSelector";
import { ThemeToggle } from "@/components/ThemeToggle";

export function MobileHeader() {
  return (
    <div className={wrapper}>
      <AptosIcon className={css({ color: "brand.logo", h: 24, w: 24 })} />
      <div className={flex({ gap: 16, align: "center" })}>
        <ConnectWalletButton />
        <NetworkSelector />
        <ThemeToggle />
      </div>
    </div>
  );
}

const wrapper = flex({
  md: { display: "none" },
  justify: "space-between",
  align: "center",
  bg: "surface",
  px: 16,
  py: 12,
  borderBottomLeftRadius: "xl",
  borderBottomRightRadius: "xl",
});
