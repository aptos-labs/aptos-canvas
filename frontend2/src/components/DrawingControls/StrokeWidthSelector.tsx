"use client";

import { STROKE_WIDTH_CONFIG } from "@/constants/canvas";
import { useCanvasState } from "@/contexts/canvas";

import { Slider } from "../Slider";

export function StrokeWidthSelector() {
  const strokeWidth = useCanvasState((s) => s.strokeWidth);

  return (
    <Slider
      value={strokeWidth}
      onChange={(value) => {
        useCanvasState.setState({ strokeWidth: value });
      }}
      orientation="vertical"
      {...STROKE_WIDTH_CONFIG}
    />
  );
}
