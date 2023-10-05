import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { useCanvasState } from "@/contexts/canvas";

import { PaintIcon } from "../Icons/PaintIcon";

export function PaintInfo() {
  const pixelsChanged = useCanvasState((s) => s.pixelsChanged);
  const changedPixelsCounts = Object.keys(pixelsChanged).length;

  return (
    <div className={stack({ align: "center", gap: 16, color: "text" })}>
      <PaintIcon />
      <div className={css({ textStyle: "body.sm.regular", textAlign: "center" })}>
        {changedPixelsCounts.toLocaleString()} <br /> Pixels
      </div>
    </div>
  );
}
