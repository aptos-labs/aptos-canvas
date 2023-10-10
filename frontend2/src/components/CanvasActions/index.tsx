"use client";

import { flex } from "styled-system/patterns";

import { emitCanvasCommand, useCanvasState } from "@/contexts/canvas";

import { Button } from "../Button";

export function CanvasActions() {
  const setViewOnly = useCanvasState((s) => s.setViewOnly);
  const pixelsChanged = useCanvasState((s) => s.pixelsChanged);
  const changedPixelsCount = Object.keys(pixelsChanged).length;

  const cancel = () => {
    setViewOnly(true);
  };

  const undo = () => {
    emitCanvasCommand("clearChangedPixels");
  };

  return (
    <div
      className={flex({
        gap: 16,
        w: "100%",
        "& > button": { flex: 1 },
      })}
    >
      {changedPixelsCount ? (
        <Button variant="secondary" onClick={undo}>
          Undo
        </Button>
      ) : (
        <Button variant="secondary" onClick={cancel}>
          Cancel
        </Button>
      )}
      <Button variant="primary" disabled={!changedPixelsCount}>
        Finish Drawing
      </Button>
    </div>
  );
}
