import { useEffect, useMemo } from "react";
import { create } from "zustand";

import { STROKE_COLORS, STROKE_WIDTH_CONFIG } from "@/constants/canvas";
import { createEventEmitter } from "@/utils/eventEmitter";
import { isServer } from "@/utils/isServer";
import { TupleIndices } from "@/utils/types";

export type CanvasCommand = "clearChangedPixels" | "undoLastChange";

export const [emitCanvasCommand, useCanvasCommandListener] =
  createEventEmitter<CanvasCommand>("canvasCommand");

export interface PixelData {
  /** x coordinate */
  x: number;
  /** y coordinate */
  y: number;
  /** color index */
  color: TupleIndices<typeof STROKE_COLORS>;
}

/** Format: { "x-y": PixelData } */
export type ImagePatch = Map<`${number}-${number}`, PixelData>;

export interface OptimisticUpdate {
  /** Collection of pixels that changed */
  imagePatch: ImagePatch;
  /** Timestamp in milliseconds when the patch was submitted to the server */
  committedAt: number;
}

export interface CanvasState {
  canDrawUnlimited: boolean;
  isInitialized: boolean;
  isViewOnly: boolean;
  setViewOnly: (isViewOnly: boolean) => boolean;
  strokeColor: TupleIndices<typeof STROKE_COLORS>;
  strokeWidth: number;
  currentChanges: Array<ImagePatch>;
  optimisticUpdates: Array<OptimisticUpdate>;
}

export const useCanvasState = create<CanvasState>((set, get) => ({
  canDrawUnlimited: false,
  isInitialized: false,
  isViewOnly: true,
  setViewOnly: (isViewOnly) => {
    if (isViewOnly && get().currentChanges.length) {
      const hasConfirmed = window.confirm(
        "You have unsaved changes on the board. Are you sure you want to discard them?",
      );
      if (!hasConfirmed) return false;
      emitCanvasCommand("clearChangedPixels");
    }
    set({ isViewOnly });
    return true;
  },
  strokeColor: 0,
  strokeWidth: STROKE_WIDTH_CONFIG.min,
  currentChanges: [],
  optimisticUpdates: [],
}));

/** This function rolls up every collection of changed pixels into one deduplicated Map. */
export function aggregatePixelsChanged(currentChanges: CanvasState["currentChanges"]) {
  const pixelsChanged: ImagePatch = new Map();

  for (const change of currentChanges) {
    for (const [point, pixel] of change) {
      pixelsChanged.set(point, pixel);
    }
  }

  return pixelsChanged;
}

/** This hook rolls up every collection of changed pixels into one deduplicated Map. */
export function useAggregatedPixelsChanged(currentChanges: CanvasState["currentChanges"]) {
  return useMemo(() => aggregatePixelsChanged(currentChanges), [currentChanges]);
}

/**
 * Since transactions should be reflected in the aggregated canvas after only a few seconds,
 * we can delete old optimistic updates to reduce our memory usage and reduce the time it takes
 * to recompute the current canvas after we fetch the base canvas image.
 */
export function useOptimisticUpdateGarbageCollector() {
  /** Time in milliseconds after which optimistic updates should be garbage collected */
  const EXPIRATION_TIME = 10_000;

  useEffect(() => {
    if (isServer()) return;

    const interval = window.setInterval(() => {
      const { optimisticUpdates } = useCanvasState.getState();
      if (!optimisticUpdates.length) return;

      const newOptimisticUpdates = optimisticUpdates.filter(
        (ou) => ou.committedAt + EXPIRATION_TIME > Date.now(),
      );
      useCanvasState.setState({ optimisticUpdates: newOptimisticUpdates });
    }, EXPIRATION_TIME);

    return () => {
      window.clearInterval(interval);
    };
  }, []);
}
