"use client";

import { useEffect } from "react";
import { tinykeys } from "tinykeys";

import { useCanvasState } from "@/contexts/canvas";
import { isServer } from "@/utils/isServer";

import { DebugOverlay } from "./DebugOverlay";
import { OtherActions } from "./OtherActions";
import { ToastAndDrawActions } from "./ToastAndDrawActions";

export function CanvasOverlay() {
  const isViewOnly = useCanvasState((s) => s.isViewOnly);
  const isDebugEnabled = useCanvasState((s) => s.isDebugEnabled);
  const supportsTouch = isServer() ? false : "ontouchstart" in document.documentElement;

  useEffect(() => {
    if (isServer()) return;

    const unsubscribe = tinykeys(window, {
      "Control+D": () => {
        useCanvasState.getState().toggleDebug();
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <>
      <ToastAndDrawActions isViewOnly={isViewOnly} />
      <OtherActions />
      {!supportsTouch && !isViewOnly && isDebugEnabled && <DebugOverlay />}
    </>
  );
}
