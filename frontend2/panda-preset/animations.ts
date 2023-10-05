import { CssKeyframes, Tokens } from "@pandacss/dev";

export const durations = {
  0: { value: "0s" },
  1: { value: "0.2s" },
  2: { value: "0.4s" },
  3: { value: "0.6s" },
  4: { value: "0.8s" },
  5: { value: "1.0s" },
} satisfies Tokens["durations"];

export const keyframes = {
  scaleIn: {
    "0%": { transform: "scale(0)", opacity: 0 },
    "100%": { transform: "scale(1)", opacity: 1 },
  },
  scaleOut: {
    "0%": { transform: "scale(1)", opacity: 1 },
    "100%": { transform: "scale(0)", opacity: 0 },
  },
  dialogScaleIn: {
    "0%": { transform: "translate(-50%, -50%) scale(0)", opacity: 0 },
    "100%": { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
  },
  dialogScaleOut: {
    "0%": { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
    "100%": { transform: "translate(-50%, -50%) scale(0)", opacity: 0 },
  },
  fadeIn: {
    "0%": { opacity: 0 },
    "100%": { opacity: 1 },
  },
  fadeOut: {
    "0%": { opacity: 1 },
    "100%": { opacity: 0 },
  },
  spin: {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
  slideInFromRight: {
    "0%": { transform: "translateX(150%)" },
    "100%": { transform: "translateX(0%)" },
  },
  slideOutToRight: {
    "0%": { transform: "translateX(0%)" },
    "100%": { transform: "translateX(150%)" },
  },
  shimmer: {
    "0%": { transform: "translateX(-100%)" },
    "100%": { transform: "translateX(100%)" },
  },
} satisfies CssKeyframes;
