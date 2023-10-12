import { rgba } from "@/utils/color";

export const PIXELS_PER_SIDE = 1000;

export const MAX_PIXELS_PER_TXN = 800;

export const STROKE_COLORS = [
  rgba({ name: "black", r: 0, g: 0, b: 0 }),
  rgba({ name: "white", r: 255, g: 255, b: 255 }),
  rgba({ name: "blue", r: 0, g: 158, b: 253 }),
  rgba({ name: "green", r: 0, g: 197, b: 3 }),
  rgba({ name: "yellow", r: 255, g: 198, b: 0 }),
  rgba({ name: "orange", r: 255, g: 125, b: 0 }),
  rgba({ name: "red", r: 250, g: 0, b: 106 }),
  rgba({ name: "violet", r: 196, g: 0, b: 199 }),
] as const;

export const STROKE_WIDTH_CONFIG = { min: 1, max: 8, step: 1 } as const;
