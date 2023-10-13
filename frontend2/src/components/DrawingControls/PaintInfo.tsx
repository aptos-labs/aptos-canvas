"use client";

import { useEffect } from "react";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

import { MAX_PIXELS_PER_TXN, MAX_PIXELS_PER_TXN_ADMIN } from "@/constants/canvas";
import { useCanvasState } from "@/contexts/canvas";

import { PaintIcon } from "../Icons/PaintIcon";
import { removeToast, toast } from "../Toast";

export interface PaintInfoProps {
  direction: "row" | "column";
}

export function PaintInfo({ direction }: PaintInfoProps) {
  const pixelsChanged = useCanvasState((s) => s.pixelsChanged);
  const changedPixelsCount = pixelsChanged.size;
  const isAdmin = useCanvasState((s) => s.isAdmin);
  const pixelLimit = isAdmin ? MAX_PIXELS_PER_TXN_ADMIN : MAX_PIXELS_PER_TXN;
  const limitReached = changedPixelsCount >= pixelLimit;

  useEffect(() => {
    const TOAST_ID = "pixel-limit-reached";
    if (limitReached) {
      toast({
        id: TOAST_ID,
        variant: "warning",
        content: "Pixel limit per transaction reached. Submit your work to continue drawing.",
        duration: null,
      });
    } else {
      removeToast(TOAST_ID);
    }
  }, [limitReached]);

  return (
    <div
      className={flex({
        direction,
        align: "center",
        gap: { base: 8, md: 16 },
        color: limitReached ? "error" : "text",
      })}
    >
      <PaintIcon />
      <div className={css({ textStyle: "body.sm.regular", textAlign: "center" })}>
        {changedPixelsCount.toLocaleString()} <br /> Pixels
      </div>
    </div>
  );
}
