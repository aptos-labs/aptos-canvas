import Image from "next/image";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

export function DesktopCanvasHeader() {
  return (
    <div className={flex({ display: "none", md: { display: "flex" }, gap: 16, align: "center" })}>
      <Image src="/images/aptos-logo.svg" alt="Aptos Logo" height={32} width={32} />
      <p className={css({ textStyle: "body.md.regular", opacity: 0.4 })}>
        <strong className={css({ textStyle: "body.md.bold" })}>
          XX days XX hours and XX minutes
        </strong>{" "}
        left before we&apos;re minting this board as an NFT.
      </p>
    </div>
  );
}
