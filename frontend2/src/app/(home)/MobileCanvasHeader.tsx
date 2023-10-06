import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { PaintInfo } from "@/components/DrawingControls/PaintInfo";

export function MobileCanvasHeader() {
  return (
    <div
      className={css({
        display: "flex",
        md: { display: "none" },
        justifyContent: "space-between",
        alignItems: "center",
      })}
    >
      <p className={stack({ gap: 0, textStyle: "body.sm.regular" })}>
        <strong className={css({ textStyle: "body.sm.bold" })}>
          XX days XX hours and XX minutes
        </strong>{" "}
        left before we&apos;re minting this as an NFT.
      </p>
      <PaintInfo direction="row" />
    </div>
  );
}
