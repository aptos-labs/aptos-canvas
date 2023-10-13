import { css } from "styled-system/css";

import { Countdown } from "@/components/Countdown";
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
      <Countdown />
      <PaintInfo direction="row" />
    </div>
  );
}
