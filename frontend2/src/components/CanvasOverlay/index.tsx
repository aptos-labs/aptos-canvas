"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { tinykeys } from "tinykeys";

import { useCanvasState } from "@/contexts/canvas";
import { isServer } from "@/utils/isServer";

import { DebugOverlay } from "./DebugOverlay";
import { OtherActions } from "./OtherActions";
import { ToastAndDrawActions } from "./ToastAndDrawActions";

export function CanvasOverlay() {
  const isInitialized = useCanvasState((s) => s.isInitialized);
  const isViewOnly = useCanvasState((s) => s.isViewOnly);
  const isDebugEnabled = useCanvasState((s) => s.isDebugEnabled);
  const [supportsTouch, setSupportsTouch] = useState(false);

  useEffect(() => {
    if (isServer()) return;
    setSupportsTouch("ontouchstart" in document.documentElement);
  }, []);

  useEffect(() => {
    if (isServer()) return;

    const unsubscribe = tinykeys(window, {
      D: () => {
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
      <AnimatePresence>{isInitialized ? <OtherActions /> : null}</AnimatePresence>
      {!supportsTouch && !isViewOnly && isDebugEnabled && <DebugOverlay />}
    </>
  );
}
