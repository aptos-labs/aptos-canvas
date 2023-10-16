import { fabric } from "fabric";
import { useEffect, useRef } from "react";
import { css } from "styled-system/css";

import { useCanvasState } from "@/contexts/canvas";

import { EventCanvas } from "./types";

export interface DrawingCursorProps {
  canvas: fabric.Canvas;
}

export function DrawingCursor({ canvas }: DrawingCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const strokeColor = useCanvasState((s) => s.strokeColor);
  const strokeWidth = useCanvasState((s) => s.strokeWidth);

  useEffect(() => {
    function positionCursor(this: EventCanvas, { e }: fabric.IEvent<MouseEvent>) {
      const cursor = cursorRef.current;
      if (!cursor) return;

      cursor.style.transform = `translate(${e.x}px, ${e.y}px)`;
    }

    canvas.on("mouse:move", positionCursor);
    return () => {
      canvas.off("mouse:move", positionCursor);
    };
  }, [canvas]);

  return (
    <div
      ref={cursorRef}
      className={css({
        pointerEvents: "none",
        position: "fixed",
        top: 0,
        left: 0,
      })}
    >
      <div
        style={{
          backgroundColor: strokeColor.value,
          scale: 1 + 0.5 * strokeWidth,
        }}
        className={css({
          pointerEvents: "none",
          position: "relative",
          transformOrigin: "top left",
          transform: "translate(-50%, -50%)",
          rounded: "full",
          w: 8,
          h: 8,
          shadow: "xs",
          transition: "background-color token(durations.2) ease, scale token(durations.1) ease",
          zIndex: 1,
          _before: {
            content: "''",
            pointerEvents: "none",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            rounded: "full",
            w: 12,
            h: 12,
            bg: "rgba(255, 255, 255, 0.5)",
            shadow: "xs",
            mixBlendMode: "multiply",
          },
        })}
      />
    </div>
  );
}
