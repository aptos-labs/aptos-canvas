"use client";

import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { STROKE_COLORS } from "@/constants/canvas";
import { useCanvasState } from "@/contexts/canvas";
import { RgbaColor } from "@/utils/color";

export function StrokeColorSelector() {
  const strokeColor = useCanvasState((s) => s.strokeColor);

  return (
    <div className={stack({ align: "center", gap: 16 })}>
      {STROKE_COLORS.map((color) => (
        <ColorButton
          key={color.value}
          color={color}
          isSelected={strokeColor.value === color.value}
        />
      ))}
    </div>
  );
}

interface ColorButtonProps {
  color: RgbaColor;
  isSelected: boolean;
}

function ColorButton({ color, isSelected }: ColorButtonProps) {
  return (
    <button
      className={css({
        cursor: "pointer",
        h: 20,
        w: 20,
        rounded: "full",
        border: "solid 1px token(colors.border)",
        boxShadow: isSelected ? "0 0 0 3px token(colors.border)" : undefined,
        transition: "box-shadow token(durations.1) ease",
      })}
      style={{ backgroundColor: color.value }}
      aria-label={`Select ${color.name ?? "color"}`}
      title={color.name}
      onClick={() => {
        useCanvasState.setState({ strokeColor: color });
      }}
    />
  );
}
