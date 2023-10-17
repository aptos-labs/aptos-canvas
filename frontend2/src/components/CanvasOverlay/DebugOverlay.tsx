import { useState } from "react";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

import { Point } from "../Canvas/types";
import { useMousePositionListener } from "../Canvas/utils";

export function DebugOverlay() {
  const [lastPoint, setLastPoint] = useState<Point>({ x: 0, y: 0 });

  useMousePositionListener((point) => {
    setLastPoint(point);
  });

  return (
    <div
      className={flex({
        position: "absolute",
        top: { base: 16, md: 24 },
        right: { base: 16, md: 24 },
        bg: "surface.secondary",
        color: "text.secondary",
        textStyle: "body.sm.bold",
        shadow: "md",
        px: 16,
        py: 12,
        rounded: "full",
        gap: 8,
      })}
    >
      <div className={flex({ gap: 2 })}>
        x : <div className={pointText}>{lastPoint.x}</div>
      </div>
      <div className={flex({ gap: 2 })}>
        y : <div className={pointText}>{lastPoint.y}</div>
      </div>
    </div>
  );
}

const pointText = css({ color: "text", minW: "4ch", textAlign: "center" });
