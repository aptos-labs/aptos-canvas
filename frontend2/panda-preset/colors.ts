import { SemanticTokens, Tokens } from "@pandacss/dev";

export const colors = {
  transparent: { value: "transparent" },
  white: { value: "#FFF" },
  black: { value: "#000" },
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
  red: {
    50: { value: "#FDF3F3" },
    100: { value: "#FCE5E4" },
    200: { value: "#FAD0CE" },
    300: { value: "#F6AEAB" },
    400: { value: "#EE807B" },
    500: { value: "#E25751" },
    600: { value: "#D34C46" },
    700: { value: "#AD2E28" },
    800: { value: "#902924" },
    900: { value: "#41100E" },
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
  green: {
    50: { value: "#F1FCF1" },
    100: { value: "#DFF9E0" },
    200: { value: "#C1F1C3" },
    300: { value: "#91E494" },
    400: { value: "#5ACE5F" },
    500: { value: "#34B53A" },
    600: { value: "#25942A" },
    700: { value: "#217425" },
    800: { value: "#1F5C22" },
    900: { value: "#1B4C1E" },
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
  periwinkle: {
    50: { value: "#EDF1FF" },
    100: { value: "#DFE4FF" },
    200: { value: "#C5CDFF" },
    300: { value: "#A2ABFF" },
    400: { value: "#7D7FFC" },
    500: { value: "#6D65F6" },
    600: { value: "#5741EA" },
    700: { value: "#4B33CF" },
    800: { value: "#3D2CA7" },
    900: { value: "#352B84" },
    950: { value: "#21194D" },
  },
} satisfies Tokens["colors"];

export const semanticColors = {
  surface: {
    DEFAULT: { value: { base: "{colors.white}", _dark: "#1F1F23" } },
    secondary: { value: { base: "#F8F8F8", _dark: "#121214" } },
  },
  text: {
    DEFAULT: { value: { base: "{colors.black}", _dark: "{colors.white}" } },
    secondary: { value: { base: "rgba(0, 0, 0, 0.4)", _dark: "rgba(255, 255, 255, 0.4)" } },
    inverted: { value: { base: "{colors.white}", _dark: "{colors.black}" } },
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
  interactive: {
    primary: {
      DEFAULT: { value: { base: "{colors.blue.600}", _dark: "{colors.periwinkle.500}" } },
      hovered: { value: { base: "{colors.blue.500}", _dark: "{colors.periwinkle.400}" } },
      pressed: { value: { base: "{colors.blue.700}", _dark: "{colors.periwinkle.600}" } },
      // Translucent versions of blue.200 and periwinkle.800 respectively
      disabled: { value: { base: "rgba(195, 207, 255, 0.75)", _dark: "rgba(53, 43, 132, 0.75)" } },
    },
    secondary: {
      DEFAULT: { value: { base: "{colors.white}", _dark: "#1F1F23" } },
      hovered: { value: { base: "{colors.navy.50}", _dark: "#393941" } },
      pressed: { value: { base: "{colors.navy.100}", _dark: "#18181C" } },
      // Translucent versions of DEFAULT
      disabled: { value: { base: "rgba(255, 255, 255, 0.75)", _dark: "rgba(31, 31, 35, 0.75)" } },
      accent: {
        DEFAULT: { value: { base: "{colors.blue.600}", _dark: "{colors.periwinkle.400}" } },
        hovered: { value: { base: "{colors.blue.500}", _dark: "{colors.periwinkle.300}" } },
        pressed: { value: { base: "{colors.blue.700}", _dark: "{colors.periwinkle.500}" } },
        disabled: { value: { base: "{colors.navy.400}", _dark: "{colors.navy.500}" } },
      },
    },
    tertiary: {
      DEFAULT: { value: { base: "#F8F8F8", _dark: "#121214" } },
      hovered: { value: { base: "{colors.navy.50}", _dark: "#393941" } },
      pressed: { value: { base: "{colors.navy.100}", _dark: "#18181C" } },
      // Translucent versions of DEFAULT
      disabled: { value: { base: "rgba(248, 248, 248, 0.75)", _dark: "rgba(18, 18, 20, 0.75)" } },
    },
    danger: {
      DEFAULT: { value: "{colors.red.600}" },
      hovered: { value: "{colors.red.500}" },
      pressed: { value: "{colors.red.700}" },
      // Translucent versions of red.200 and red.900 respectively
      disabled: { value: { base: "rgba(250, 208, 206, 0.75)", _dark: "rgba(65, 16, 14, 0.75)" } },
    },
  },
  border: { value: { base: "#D1D1D1", _dark: "#4C4C4F" } },
  canvas: {
    bg: { value: { base: "{colors.navy.100}", _dark: "#1F1F23" } },
  },
  slider: {
    track: { value: { base: "#DFDFDF", _dark: "#4C4C4F" } },
    range: { value: { base: "{colors.black}", _dark: "{colors.white}" } },
    thumb: {
      bg: { value: { base: "{colors.white}", _dark: "{colors.white}" } },
      text: { value: { base: "{colors.black}", _dark: "{colors.black}" } },
    },
  },
  spinner: {
    primary: {
      arc: { value: { base: "{colors.blue.600}", _dark: "{colors.periwinkle.500}" } },
      track: { value: { base: "{colors.blue.100}", _dark: "{colors.periwinkle.950}" } },
    },
    onInteractive: {
      arc: { value: "{colors.white}" },
      track: { value: "rgba(255, 255, 255, 0.4)" },
    },
  },
  toast: { value: { base: "{colors.white}", _dark: "#121214" } },
  skeleton: {
    DEFAULT: { value: { base: "{colors.navy.100}", _dark: "#1F1F23" } },
    shimmer1: { value: { base: "rgba(255, 255, 255, 0)", _dark: "rgba(64, 64, 64, 0)" } },
    shimmer2: { value: { base: "rgba(255, 255, 255, 0.2)", _dark: "rgba(64, 64, 64, 0.2)" } },
    shimmer3: { value: { base: "rgba(255, 255, 255, 0.5)", _dark: "rgba(64, 64, 64, 0.5)" } },
  },
  shadow: { value: { base: "rgba(0, 0, 0, 0.2)", _dark: "rgba(255, 255, 255, 0.2)" } },
  focusBg: { value: { base: "rgba(64, 64, 64, 0.1)", _dark: "rgba(192, 192, 192, 0.1)" } },
  dialogOverlay: { value: { base: "rgba(0, 0, 0, 0.25)", _dark: "rgba(0, 0, 0, 0.4)" } },
  warning: { value: "{colors.orange.600}" },
  error: { value: "{colors.red.600}" },
  success: { value: "{colors.green.500}" },
  brand: {
    logo: {
      DEFAULT: { value: { base: "{colors.black}", _dark: "{colors.white}" } },
      bg: { value: { base: "{colors.white}", _dark: "{colors.black}" } },
    },
  },
} satisfies SemanticTokens["colors"];
