import { AptosClient } from "aptos";
import { useEffect, useMemo } from "react";
import { create } from "zustand";

import { STROKE_COLORS, STROKE_WIDTH_CONFIG } from "@/constants/canvas";
import { APP_CONFIG } from "@/constants/config";
import { RgbaColor } from "@/utils/color";
import { createEventEmitter } from "@/utils/eventEmitter";
import { isServer } from "@/utils/isServer";

import { useAptosNetworkState } from "./wallet";

export type CanvasCommand = "clearChangedPixels" | "undoLastChange";

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

/** Format: { "x-y": PixelData } */
export type ImagePatch = Map<`${number}-${number}`, PixelData>;

export interface OptimisticUpdate {
  /** Collection of pixels that changed */
  imagePatch: ImagePatch;
  /** Timestamp in milliseconds when the patch was submitted to the server */
  committedAt: number;
}

export interface CanvasState {
  isAdmin: boolean;
  isInitialized: boolean;
  isViewOnly: boolean;
  setViewOnly: (isViewOnly: boolean) => boolean;
  strokeColor: RgbaColor;
  strokeWidth: number;
  currentChanges: Array<ImagePatch>;
  optimisticUpdates: Array<OptimisticUpdate>;
  drawEnabledForNonAdmin: boolean;
}

export const useCanvasState = create<CanvasState>((set, get) => ({
  isAdmin: false,
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
  strokeColor: STROKE_COLORS[0],
  strokeWidth: STROKE_WIDTH_CONFIG.min,
  currentChanges: [],
  optimisticUpdates: [],
  drawEnabledForNonAdmin: true,
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

const ExampleCanvasMoveResource = {
  admins: {
    data: [] as Array<string>,
  },
  allowlisted_artists: {
    data: [] as Array<string>,
  },
  blocklisted_artists: {
    data: [] as Array<string>,
  },
  config: {
    can_draw_for_s: "0",
    can_draw_multiple_pixels_at_once: true,
    cost: "0",
    cost_multiplier: "2",
    cost_multiplier_decay_s: "300",
    draw_enabled_for_non_admin: true,
    height: "1000",
    max_number_of_pixels_per_draw: "3000",
    owner_is_super_admin: true,
    palette: [],
    per_account_timeout_s: "10",
    width: "1000",
  },
  created_at_s: "1696989379",
  extend_ref: {
    self: "0xf1b675e890459dfe0a676c01bd14caca20e35634babccc310b49a14c883ea435",
  },
  last_contribution_s: {
    buckets: {
      inner: {
        handle: "0x2c2c2685cf9383c5645357e1f0e4ac0d0f10149b7eb00c15384bd1f7307c1133",
      },
      length: "7",
    },
    level: 2,
    num_buckets: "7",
    size: "109",
    split_load_threshold: 75,
    target_bucket_size: "21",
  },
  mutator_ref: {
    self: "0xf1b675e890459dfe0a676c01bd14caca20e35634babccc310b49a14c883ea435",
  },
  pixels: {
    buckets: {
      inner: {
        handle: "0xe1132372efef6089c1174a3300ea64c671b2e6eb9d2a83027c0563cdece4f153",
      },
      length: "36037",
    },
    level: 15,
    num_buckets: "36037",
    size: "1000000",
    split_load_threshold: 75,
    target_bucket_size: "37",
  },
};

type CanvasMoveResource = typeof ExampleCanvasMoveResource;

export function useLatestDrawEnabledForNonAdmin() {
  const REFETCH_MS = 10_000;
  const { network } = useAptosNetworkState();
  const aptosClient = useMemo(() => new AptosClient(APP_CONFIG[network].rpcUrl), [network]);

  useEffect(() => {
    if (isServer()) return;

    const fetch = async () => {
      const canvas = (
        await aptosClient.getAccountResource(
          APP_CONFIG[network].canvasTokenAddr,
          `${APP_CONFIG[network].canvasAddr}::canvas_token::Canvas`,
        )
      ).data as unknown as CanvasMoveResource;
      useCanvasState.setState({ drawEnabledForNonAdmin: canvas.config.draw_enabled_for_non_admin });
    };

    fetch().catch(console.error);
    const interval = window.setInterval(fetch, REFETCH_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [aptosClient, network]);
}
