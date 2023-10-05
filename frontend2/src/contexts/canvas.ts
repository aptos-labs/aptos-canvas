import { create } from "zustand";

import { STROKE_COLORS, STROKE_WIDTH_CONFIG } from "@/constants/canvas";
import { RgbaColor } from "@/utils/color";

export interface CanvasState {
  isDrawing: boolean;
  strokeColor: RgbaColor;
  strokeWidth: number;
}

export const useCanvasState = create<CanvasState>(() => ({
  isDrawing: true,
  strokeColor: STROKE_COLORS[0],
  strokeWidth: STROKE_WIDTH_CONFIG.min,
}));
