import Image from "next/image";
import { flex } from "styled-system/patterns";

import { ConnectWalletButton } from "@/components/ConnectWalletModal";
import { NetworkSelector } from "@/components/NetworkSelector";
import { ThemeToggle } from "@/components/ThemeToggle";

export function MobileHeader() {
  return (
    <div className={wrapper}>
      <Image src="/images/aptos-logo.svg" alt="Aptos Logo" height={24} width={24} />
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
