"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { motion } from "framer-motion";
import { cva, type RecipeVariantProps } from "styled-system/css";
import { flex } from "styled-system/patterns";

import { CheckboxCircleIcon } from "../Icons/CheckboxCircleIcon";
import { ErrorWarningIcon } from "../Icons/ErrorWarningIcon";

export type ToastVariants = Required<NonNullable<RecipeVariantProps<typeof toastStyles>>>;

export interface ToastProps extends ToastVariants {
  id: string;
  content: React.ReactNode;
  duration?: number | null;
}

export function Toast(props: ToastProps) {
  const icon = iconMap[props.variant];

  return (
    <ToastPrimitive.Root open={true} asChild>
      <motion.div
        layout
        initial={{ transform: "scale(0)", opacity: 0 }}
        animate={{ transform: "scale(1)", opacity: 1 }}
        exit={{ transform: "scale(0)", opacity: 0 }}
        className={toastStyles({ variant: props.variant })}
      >
        <ToastPrimitive.Description
          className={flex({
            textStyle: "body.md.regular",
            textAlign: props.variant === "info" ? "center" : "left",
            justify: props.variant === "info" ? "center" : "flex-start",
            align: "center",
            gap: 12,
            w: "100%",
          })}
        >
          {icon}
          {props.content}
        </ToastPrimitive.Description>
      </motion.div>
    </ToastPrimitive.Root>
  );
}

const iconMap: Record<ToastProps["variant"], React.ReactNode> = {
  success: <CheckboxCircleIcon />,
  warning: <ErrorWarningIcon />,
  error: <ErrorWarningIcon />,
  info: null,
};

const toastStyles = cva({
  base: {
    display: "flex",
    w: "100%",
    px: 24,
    py: 20,
    bg: "surface",
    rounded: "lg",
    shadow: "md",
  },
  variants: {
    variant: {
      success: { bg: "success", color: "text.onInteractive.primary" },
      warning: { bg: "warning", color: "text.onInteractive.primary" },
      error: { bg: "error", color: "text.onInteractive.primary" },
      info: { bg: "surface", color: "text" },
    },
  },
});
