import { definePreset } from "@pandacss/dev";

import { durations, keyframes } from "./animations";
import { colors, semanticColors } from "./colors";
import { radii, shadows, sizes, spacing, zIndex } from "./scales";
import { fonts, fontSizes, fontWeights, textStyles } from "./text";

export const aptosPandaPreset = definePreset({
  theme: {
    breakpoints: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    keyframes,
    tokens: {
      colors,
      durations,
      fonts,
      fontSizes,
      fontWeights,
      radii,
      shadows,
      sizes,
      spacing,
      zIndex,
    },
    semanticTokens: {
      colors: semanticColors,
    },
    textStyles,
  },
});
