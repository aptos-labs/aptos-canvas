"use client";

import { css, cx } from "styled-system/css";
import { flex } from "styled-system/patterns";

import { STROKE_COLORS } from "@/constants/canvas";
import { useCanvasState } from "@/contexts/canvas";
import { RgbaColor } from "@/utils/color";
import { TupleIndices } from "@/utils/types";

export interface StrokeColorSelectorProps {
  direction: "row" | "column";
  className?: string;
}

export function StrokeColorSelector({ direction, className }: StrokeColorSelectorProps) {
  const strokeColor = useCanvasState((s) => s.strokeColor);

  return (
    <div className={cx(flex({ direction, align: "center", gap: 16 }), className)}>
      {STROKE_COLORS.map((color, i) => (
        <ColorButton
          key={color.value}
          color={color}
          index={i as TupleIndices<typeof STROKE_COLORS>}
          isSelected={strokeColor === i}
          size={direction === "row" ? "md" : "sm"}
        />
      ))}
    </div>
  );
}

interface ColorButtonProps {
  color: RgbaColor;
  index: TupleIndices<typeof STROKE_COLORS>;
  isSelected: boolean;
  size: "sm" | "md";
}

function ColorButton({ color, index, isSelected, size }: ColorButtonProps) {
  return (
    <button
      className={css({
        cursor: "pointer",
        h: size === "sm" ? 20 : 24,
        w: size === "sm" ? 20 : 24,
        rounded: "full",
        border: "solid 1px token(colors.border)",
        boxShadow: isSelected ? "0 0 0 3px token(colors.border)" : "0 0 0 0px token(colors.border)",
        transition: "box-shadow token(durations.2) ease",
      })}
      style={{ backgroundColor: color.value }}
      aria-label={`Select ${color.name ?? "color"}`}
      title={color.name}
      onClick={() => {
        useCanvasState.setState({ strokeColor: index });
      }}
    />
  );
}
