import { css } from "styled-system/css";

import { StrokeColorSelector } from "@/components/DrawingControls/StrokeColorSelector";

export function MobileCanvasFooter() {
  return (
    <div
      className={css({
        display: "flex",
        md: { display: "none" },
        justifyContent: "center",
      })}
    >
      <StrokeColorSelector direction="row" />
    </div>
  );
}
