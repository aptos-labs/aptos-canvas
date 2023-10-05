import { defineConfig } from "@pandacss/dev";
import { aptosPandaPreset } from "./panda-preset";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Use the Aptos Panda preset
  presets: [aptosPandaPreset],

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // The output directory for your css system
  outdir: "styled-system",
});
