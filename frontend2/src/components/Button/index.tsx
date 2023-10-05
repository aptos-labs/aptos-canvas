// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

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
  ({ variant = "primary", size, iconOnly, loading, disabled, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-loading={loading || undefined}
        disabled={disabled || loading}
        className={cx(buttonStyles({ variant, size, iconOnly }), className)}
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
              color={variant === "primary" || variant === "danger" ? "onInteractive" : "secondary"}
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
        borderColor: "border",
        color: "text.onInteractive.secondary",
        "&:hover:not(:disabled)": {
          bg: "interactive.secondary.hovered",
          borderColor: "border.hovered",
        },
        "&:active:not(:disabled)": {
          bg: "interactive.secondary.pressed",
          borderColor: "border.pressed",
        },
        "&:disabled:not([data-loading=true])": {
          bg: "interactive.secondary.disabled",
          borderColor: "border.disabled",
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
      sm: { textStyle: "body.sm.medium", px: 20, h: 40, rounded: "md" },
      md: { textStyle: "body.md.medium", px: 20, h: 48, rounded: "md" },
    },
    iconOnly: { true: { px: 0, rounded: "full" } },
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
