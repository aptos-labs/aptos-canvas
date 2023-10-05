import { create } from "zustand";

import { STROKE_COLORS, STROKE_WIDTH_CONFIG } from "@/constants/canvas";
import { RgbaColor } from "@/utils/color";

export interface CanvasState {
  isDrawing: boolean;
  strokeColor: RgbaColor;
  strokeWidth: number;
  /** Format: { "x-y": rgba(0, 0, 0, 1) } */
  pixelsChanged: Record<`${number}-${number}`, string>;
}

export const useCanvasState = create<CanvasState>(() => ({
  isDrawing: true,
  strokeColor: STROKE_COLORS[0],
  strokeWidth: STROKE_WIDTH_CONFIG.min,
  pixelsChanged: {},
}));
