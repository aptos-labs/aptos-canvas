import Image from "next/image";
import { css } from "styled-system/css";

import { ThemeToggle } from "@/components/ThemeToggle";

export function MobileHeader() {
  return (
    <div className={wrapper}>
      <Image src="/images/aptos-logo.svg" alt="Aptos Logo" height={24} width={24} />
      <ThemeToggle />
    </div>
  );
}

const wrapper = css({
  display: "flex",
  md: { display: "none" },
  justifyContent: "space-between",
  alignItems: "center",
  bg: "surface",
  px: 16,
  py: 12,
  borderBottomLeftRadius: "xl",
  borderBottomRightRadius: "xl",
});
