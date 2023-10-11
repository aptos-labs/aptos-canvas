import { defineTextStyles, Tokens } from "@pandacss/dev";

export const fonts = {
  sans: { value: "var(--font-dm-sans), sans-serif" },
  mono: { value: "Courier, monospace" },
} satisfies Tokens["fonts"];

export const fontWeights = {
  regular: { value: "400" },
  medium: { value: "500" },
  bold: { value: "700" },
} satisfies Tokens["fontWeights"];

export const fontSizes = {
  12: { value: "0.75rem" },
  14: { value: "0.875rem" },
  16: { value: "1rem" },
  18: { value: "1.125rem" },
  20: { value: "1.25rem" },
  24: { value: "1.5rem" },
  28: { value: "1.75rem" },
  36: { value: "2.25rem" },
  40: { value: "2.5rem" },
  44: { value: "2.75rem" },
  48: { value: "3rem" },
  56: { value: "3.5rem" },
} satisfies Tokens["fontSizes"];

const bodySm = {
  fontFamily: fonts.sans.value,
  fontSize: fontSizes[12].value,
  lineHeight: fontSizes[20].value,
};

const bodyMd = {
  fontFamily: fonts.sans.value,
  fontSize: fontSizes[14].value,
  lineHeight: fontSizes[20].value,
};

const bodyLg = {
  fontFamily: fonts.sans.value,
  fontSize: fontSizes[16].value,
  lineHeight: fontSizes[24].value,
};

export const textStyles = defineTextStyles({
  body: {
    sm: {
      regular: { value: { ...bodySm, fontWeight: fontWeights.regular.value } },
      medium: { value: { ...bodySm, fontWeight: fontWeights.medium.value } },
      bold: { value: { ...bodySm, fontWeight: fontWeights.bold.value } },
    },
    md: {
      regular: { value: { ...bodyMd, fontWeight: fontWeights.regular.value } },
      medium: { value: { ...bodyMd, fontWeight: fontWeights.medium.value } },
      bold: { value: { ...bodyMd, fontWeight: fontWeights.bold.value } },
    },
    lg: {
      regular: { value: { ...bodyLg, fontWeight: fontWeights.regular.value } },
      medium: { value: { ...bodyLg, fontWeight: fontWeights.medium.value } },
      bold: { value: { ...bodyLg, fontWeight: fontWeights.bold.value } },
    },
  },
  heading: {
    xl: {
      value: {
        fontFamily: fonts.sans.value,
        fontSize: fontSizes[20].value,
        lineHeight: fontSizes[28].value,
        fontWeight: fontWeights.bold.value,
      },
    },
  },
});
