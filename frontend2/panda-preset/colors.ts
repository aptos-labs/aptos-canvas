import { SemanticTokens, Tokens } from "@pandacss/dev";

export const colors = {
  transparent: { value: "transparent" },
  white: { value: "#FFF" },
  black: { value: "#000" },
  salmon: {
    50: { value: "#FFF0F0" },
    100: { value: "#FFBDBD" },
    200: { value: "#FF9E9E" },
    300: { value: "#FF8A8A" },
    400: { value: "#FF7575" },
    500: { value: "#FF5F5F" },
    600: { value: "#E15656" },
    700: { value: "#953232" },
    800: { value: "#6F2525" },
    900: { value: "#63171B" },
  },
  navy: {
    50: { value: "#F1F2F3" },
    100: { value: "#DEE1E3" },
    200: { value: "#C2C7CC" },
    300: { value: "#B7BCBD" },
    400: { value: "#A1A9AF" },
    500: { value: "#828C95" },
    600: { value: "#4D5C6D" },
    700: { value: "#324459" },
    800: { value: "#172B45" },
    900: { value: "#1C2B43" },
  },
  green: {
    50: { value: "#EDF9F8" },
    100: { value: "#D8EEEC" },
    200: { value: "#B8E0DD" },
    300: { value: "#95D0CC" },
    400: { value: "#70C0BA" },
    500: { value: "#4EB1AA" },
    600: { value: "#49A69F" },
    700: { value: "#3E8E88" },
    800: { value: "#306E69" },
    900: { value: "#214B47" },
  },
  orange: {
    50: { value: "#FEF8F1" },
    100: { value: "#FDF4E7" },
    200: { value: "#FCEBD4" },
    300: { value: "#F9D4A4" },
    400: { value: "#F6BE74" },
    500: { value: "#F3A845" },
    600: { value: "#F09114" },
    700: { value: "#D18B00" },
    800: { value: "#9E6900" },
    900: { value: "#6B4700" },
  },
  blue: {
    50: { value: "#EDF1FF" },
    100: { value: "#DDE6FF" },
    200: { value: "#C3CFFF" },
    300: { value: "#9EAFFF" },
    400: { value: "#7784FF" },
    500: { value: "#575BFD" },
    600: { value: "#4339F2" },
    700: { value: "#392CD6" },
    800: { value: "#2F27AC" },
    900: { value: "#2B2788" },
    950: { value: "#1B174F" },
  },
} satisfies Tokens["colors"];

export const semanticColors = {
  surface: {
    DEFAULT: { value: "{colors.white}" },
    secondary: { value: "#F8F8F8" }, // grey
  },
  text: {
    DEFAULT: { value: "{colors.black}" },
    secondary: { value: "{colors.navy.500}" },
    inverted: { value: "{colors.white}" },
    onInteractive: {
      primary: {
        DEFAULT: { value: "{colors.white}" },
        disabled: { value: "{colors.white}" },
      },
      secondary: {
        DEFAULT: { value: "{colors.navy.900}" },
        disabled: { value: "{colors.navy.300}" },
      },
    },
  },
  link: {
    DEFAULT: { value: "{colors.navy.900}" },
    secondary: { value: "{colors.navy.600}" },
  },
  interactive: {
    primary: {
      DEFAULT: { value: "{colors.blue.600}" },
      hovered: { value: "{colors.blue.500}" },
      pressed: { value: "{colors.blue.700}" },
      disabled: { value: "{colors.blue.200}" },
    },
    secondary: {
      DEFAULT: { value: "{colors.white}" },
      hovered: { value: "{colors.navy.50}" },
      pressed: { value: "{colors.navy.100}" },
      disabled: { value: "{colors.transparent}" },
    },
    danger: {
      DEFAULT: { value: "{colors.error}" },
      hovered: { value: "{colors.salmon.600}" },
      pressed: { value: "{colors.salmon.700}" },
      disabled: { value: "{colors.salmon.100}" },
    },
  },
  border: {
    DEFAULT: { value: "{colors.navy.100}" },
    hovered: { value: "{colors.navy.200}" },
    pressed: { value: "{colors.navy.300}" },
    disabled: { value: "{colors.navy.100}" },
    faint: { value: "{colors.navy.50}" },
  },
  spinner: {
    primary: {
      arc: { value: "{colors.blue.600}" },
      track: { value: "{colors.blue.100}" },
    },
    onInteractive: {
      arc: { value: "{colors.white}" },
      track: { value: "rgba(255, 255, 255, 0.4)" },
    },
  },
  skeleton: { value: "{colors.navy.100}" },
  dialogOverlay: { value: "rgba(0, 0, 0, 0.25)" },
  warning: {
    DEFAULT: { value: "{colors.orange.600}" },
    strong: { value: "{colors.orange.900}" },
    faint: { value: "{colors.orange.50}" },
  },
  error: {
    DEFAULT: { value: "#BC2626" },
    strong: { value: "{colors.salmon.900}" },
    faint: { value: "{colors.salmon.50}" },
  },
  success: {
    DEFAULT: { value: "#34B53A" },
    strong: { value: "{colors.green.900}" },
    faint: { value: "{colors.green.50}" },
  },
  brand: {
    logo: {
      DEFAULT: { value: "{colors.black}" },
      bg: { value: "{colors.white}" },
    },
  },
} satisfies SemanticTokens["colors"];
