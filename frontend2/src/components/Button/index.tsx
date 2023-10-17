"use client";

import { forwardRef, ReactNode } from "react";
import { css, cva, cx, type RecipeVariantProps } from "styled-system/css";
import { center } from "styled-system/patterns";

import { Spinner } from "../Spinner";

type ButtonVariants = NonNullable<RecipeVariantProps<typeof buttonStyles>>;
type ButtonAttributes = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">;

export interface ButtonProps extends ButtonAttributes, ButtonVariants {
  loading?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size, iconOnly, rounded, loading, disabled, className, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        data-loading={loading || undefined}
        disabled={disabled || loading}
        className={cx(buttonStyles({ variant, size, iconOnly, rounded }), className)}
        {...props}
      >
        <div className={center({ visibility: loading ? "hidden" : "visible", gap: 8 })}>
          {props.children}
        </div>
        {loading && (
          <div
            className={css({
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            })}
          >
            <Spinner
              size="md"
              color={variant === "primary" || variant === "danger" ? "onInteractive" : "primary"}
            />
          </div>
        )}
      </button>
    );
  },
);
Button.displayName = "Button";

const buttonStyles = cva({
  base: {
    position: "relative",
    borderStyle: "solid",
    borderWidth: "1px",
    cursor: "pointer",
    _disabled: { cursor: "not-allowed", "&[data-loading=true]": { cursor: "wait" } },
    "&:active:not(:disabled)": { transform: "scale(1.02)" },
    transition:
      "background token(durations.1) ease, border-color token(durations.1) ease, transform token(durations.1) ease",
  },

  variants: {
    variant: {
      primary: {
        bg: "interactive.primary",
        borderColor: "interactive.primary",
        color: "text.onInteractive.primary",
        "&:hover:not(:disabled)": {
          bg: "interactive.primary.hovered",
          borderColor: "interactive.primary.hovered",
        },
        "&:active:not(:disabled)": {
          bg: "interactive.primary.pressed",
          borderColor: "interactive.primary.pressed",
        },
        "&:disabled:not([data-loading=true])": {
          bg: "interactive.primary.disabled",
          borderColor: "interactive.primary.disabled",
        },
      },
      secondary: {
        bg: "interactive.secondary",
        borderColor: "interactive.secondary.accent",
        color: "interactive.secondary.accent",
        "&:hover:not(:disabled)": {
          bg: "interactive.secondary.hovered",
          color: "interactive.secondary.accent.hovered",
          borderColor: "interactive.secondary.accent.hovered",
        },
        "&:active:not(:disabled)": {
          bg: "interactive.secondary.pressed",
          color: "interactive.secondary.accent.pressed",
          borderColor: "interactive.secondary.accent.pressed",
        },
        "&:disabled:not([data-loading=true])": {
          bg: "interactive.secondary.disabled",
          color: "interactive.secondary.accent.disabled",
          borderColor: "interactive.secondary.accent.disabled",
        },
      },
      tertiary: {
        bg: "interactive.tertiary",
        borderColor: "interactive.tertiary",
        color: "text",
        "&:hover:not(:disabled)": {
          bg: "interactive.tertiary.hovered",
          borderColor: "interactive.tertiary.hovered",
        },
        "&:active:not(:disabled)": {
          bg: "interactive.tertiary.pressed",
          borderColor: "interactive.tertiary.pressed",
        },
        "&:disabled:not([data-loading=true])": {
          bg: "interactive.tertiary.disabled",
          borderColor: "interactive.tertiary.disabled",
          color: "text.onInteractive.secondary.disabled",
        },
      },
      danger: {
        bg: "interactive.danger",
        borderColor: "interactive.danger",
        color: "text.onInteractive.primary",
        "&:hover:not(:disabled)": {
          bg: "interactive.danger.hovered",
          borderColor: "interactive.danger.hovered",
        },
        "&:active:not(:disabled)": {
          bg: "interactive.danger.pressed",
          borderColor: "interactive.danger.pressed",
        },
        "&:disabled:not([data-loading=true])": {
          bg: "interactive.danger.disabled",
          borderColor: "interactive.danger.disabled",
        },
      },
    },
    size: {
      xs: { textStyle: "body.sm.medium", px: 16, h: 32, rounded: "md" },
      sm: { textStyle: "body.sm.medium", px: 20, h: 40, rounded: "md" },
      md: { textStyle: "body.md.medium", px: 20, h: 48, rounded: "md" },
    },
    iconOnly: { true: { px: 0 } },
    rounded: { true: { rounded: "full" } },
  },

  compoundVariants: [
    { size: "sm", iconOnly: true, css: { w: 40 } },
    { size: "md", iconOnly: true, css: { w: 48 } },
  ],

  defaultVariants: {
    variant: "primary",
    size: "md",
    iconOnly: false,
  },
});
