import Image from "next/image";
import { css } from "styled-system/css";
import { flex, stack } from "styled-system/patterns";

import { SidePanel } from "@/components/DrawingControls/SidePanel";

import { CanvasContainer } from "./CanvasContainer";

export default function LandingPage() {
  return (
    <div className={wrapper}>
      <SidePanel />
      <main className={main}>
        <div className={flex({ gap: 16, align: "center" })}>
          <Image src="/images/aptos-logo.svg" alt="Aptos Logo" height={32} width={32} />
          <p className={css({ textStyle: "body.md.regular", opacity: 0.4 })}>
            <strong className={css({ textStyle: "body.md.bold" })}>
              XX days XX hours and XX minutes
            </strong>{" "}
            left before we&apos;re minting this board as an NFT.
          </p>
        </div>
        <CanvasContainer />
      </main>
    </div>
  );
}

const wrapper = css({
  display: "grid",
  gridTemplateColumns: "auto minmax(0, 1fr)",
  height: "100svh",
  width: "100vw",
  overflow: "hidden",
  bg: "surface.secondary",
});

const main = stack({
  p: 32,
  gap: 24,
});
