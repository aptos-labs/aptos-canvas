import { css } from "styled-system/css";

import { StrokeWidthSelector } from "@/components/DrawingControls/StrokeWidthSelector";

export function MobileCanvasSidePanel() {
  return (
    <div
      className={css({ display: "flex", md: { display: "none" }, alignSelf: "center", ml: -12 })}
    >
      <StrokeWidthSelector />
    </div>
  );
}
