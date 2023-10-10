import { Tokens } from "@pandacss/dev";
// 10, 12, 20
export const radii = {
  xs: { value: "0.375rem" }, // 6px
  sm: { value: "0.5rem" }, // 8px
  md: { value: "0.625rem" }, // 10px
  lg: { value: "0.75rem" }, // 12px
  xl: { value: "1rem" }, // 16px
  "2xl": { value: "1.25rem" }, // 20px
  full: { value: "9999px" },
} satisfies Tokens["radii"];

export const shadows = {
  sm: { value: "0px 0px 10px 0px rgba(0, 0, 0, 0.20)" },
  md: { value: "0px 0px 20px 0px rgba(0, 0, 0, 0.20)" },
} satisfies Tokens["shadows"];

export const spacing = {
  0: { value: "0rem" }, // 0px
  2: { value: "0.125rem" }, // 2px
  4: { value: "0.25rem" }, // 4px
  8: { value: "0.5rem" }, // 8px
  12: { value: "0.75rem" }, // 12px
  16: { value: "1rem" }, // 16px
  20: { value: "1.25rem" }, // 20px
  24: { value: "1.5rem" }, // 24px
  32: { value: "2rem" }, // 32px
  40: { value: "2.5rem" }, // 40px
  48: { value: "3rem" }, // 48px
  56: { value: "3.5rem" }, // 56px
  64: { value: "4rem" }, // 64px
  80: { value: "5rem" }, // 80px
  96: { value: "6rem" }, // 96px
  112: { value: "7rem" }, // 112px
  128: { value: "8rem" }, // 128px
  144: { value: "9rem" }, // 144px
  160: { value: "10rem" }, // 160px
  176: { value: "11rem" }, // 176px
  192: { value: "12rem" }, // 192px
  208: { value: "13rem" }, // 208px
  224: { value: "14rem" }, // 224px
  240: { value: "15rem" }, // 240px
  256: { value: "16rem" }, // 256px
  288: { value: "18rem" }, // 288px
  320: { value: "20rem" }, // 320px
  384: { value: "24rem" }, // 384px
} satisfies Tokens["spacing"];

export const sizes = {
  ...spacing,
  prose: { value: "65ch" },
  md: { value: "28rem" }, // 448px
  lg: { value: "32rem" }, // 512px
  xl: { value: "36rem" }, // 576px
  "2xl": { value: "42rem" }, // 672px
  "3xl": { value: "48rem" }, // 768px
  "4xl": { value: "56rem" }, // 896px
  "5xl": { value: "64rem" }, // 1024px
  "6xl": { value: "72rem" }, // 1152px
  "7xl": { value: "80rem" }, // 1280px
  "8xl": { value: "90rem" }, // 1440px
  full: { value: "100%" },
  min: { value: "min-content" },
  max: { value: "max-content" },
  fit: { value: "fit-content" },
} satisfies Tokens["sizes"];

export const zIndex = {
  dialog: { value: 100 },
  dropdown: { value: 200 },
  toast: { value: 300 },
} satisfies Tokens["zIndex"];
