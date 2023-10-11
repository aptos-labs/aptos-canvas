import { create } from "zustand";

import { STROKE_COLORS, STROKE_WIDTH_CONFIG } from "@/constants/canvas";
import { RgbaColor } from "@/utils/color";
import { createEventEmitter } from "@/utils/eventEmitter";

export type CanvasCommand = "clearChangedPixels";

export const [emitCanvasCommand, useCanvasCommandListener] =
  createEventEmitter<CanvasCommand>("canvasCommand");

export interface PixelData {
  /** x coordinate */
  x: number;
  /** y coordinate */
  y: number;
  /** red value */
  r: number;
  /** green value */
  g: number;
  /** blue value */
  b: number;
}

export interface CanvasState {
  isInitialized: boolean;
  isViewOnly: boolean;
  setViewOnly: (isViewOnly: boolean) => void;
  strokeColor: RgbaColor;
  strokeWidth: number;
  /** Format: { "x-y": PixelData } */
  pixelsChanged: Record<`${number}-${number}`, PixelData>;
}

export const useCanvasState = create<CanvasState>((set, get) => ({
  isInitialized: false,
  isViewOnly: true,
  setViewOnly: (isViewOnly) => {
    if (isViewOnly && Object.keys(get().pixelsChanged).length) {
      const hasConfirmed = window.confirm(
        "You have unsaved changes on the board. Are you sure you want to discard them?",
      );
      if (hasConfirmed) emitCanvasCommand("clearChangedPixels");
      else return;
    }
    set({ isViewOnly });
  },
  strokeColor: STROKE_COLORS[0],
  strokeWidth: STROKE_WIDTH_CONFIG.min,
  pixelsChanged: {},
}));
