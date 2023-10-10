"use client";

import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

import { useCanvasState } from "@/contexts/canvas";

import { PaintIcon } from "../Icons/PaintIcon";

export interface PaintInfoProps {
  direction: "row" | "column";
}

export function PaintInfo({ direction }: PaintInfoProps) {
  const pixelsChanged = useCanvasState((s) => s.pixelsChanged);
  const changedPixelsCount = Object.keys(pixelsChanged).length;

  return (
    <div className={flex({ direction, align: "center", gap: { base: 8, md: 16 }, color: "text" })}>
      <PaintIcon />
      <div className={css({ textStyle: "body.sm.regular", textAlign: "center" })}>
        {changedPixelsCount.toLocaleString()} <br /> Pixels
      </div>
    </div>
  );
}
