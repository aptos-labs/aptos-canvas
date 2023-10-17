"use client";

import { useEffect } from "react";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

import { MAX_PIXELS_PER_TXN, MAX_PIXELS_PER_TXN_ADMIN } from "@/constants/canvas";
import { useAggregatedPixelsChanged, useCanvasState } from "@/contexts/canvas";

import { PaintIcon } from "../Icons/PaintIcon";
import { removeToast, toast } from "../Toast";

const PIXEL_LIMIT_TOAST_ID = "pixel-limit-reached";

export interface PaintInfoProps {
  direction: "row" | "column";
}

export function PaintInfo({ direction }: PaintInfoProps) {
  const currentChanges = useCanvasState((s) => s.currentChanges);
  const pixelsChanged = useAggregatedPixelsChanged(currentChanges);
  const changedPixelsCount = pixelsChanged.size;
  const canDrawUnlimited = useCanvasState((s) => s.canDrawUnlimited);
  const pixelLimit = canDrawUnlimited ? MAX_PIXELS_PER_TXN_ADMIN : MAX_PIXELS_PER_TXN;
  const limitReached = changedPixelsCount >= pixelLimit;

  useEffect(() => {
    if (!limitReached) return;

    toast({
      id: PIXEL_LIMIT_TOAST_ID,
      variant: "warning",
      content: "Pixel limit per transaction reached. Submit your work to continue drawing.",
      duration: null,
    });

    return () => {
      removeToast(PIXEL_LIMIT_TOAST_ID);
    };
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
        {(pixelLimit - changedPixelsCount).toLocaleString()} <br /> Pixels
      </div>
    </div>
  );
}
