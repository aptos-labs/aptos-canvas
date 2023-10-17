"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { css } from "styled-system/css";
import { flex, stack } from "styled-system/patterns";
import { tinykeys } from "tinykeys";

import { Point } from "@/components/Canvas/types";
import { useMousePositionListener } from "@/components/Canvas/utils";
import { CanvasActions } from "@/components/CanvasActions";
import { ToastContainer } from "@/components/Toast";
import { useCanvasState } from "@/contexts/canvas";
import { isServer } from "@/utils/isServer";

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
      <div
        className={stack({
          gap: 0,
          position: "absolute",
          bottom: { base: 16, md: 48 },
          justify: "center",
          align: "center",
        })}
      >
        <div className={css({ position: "relative", w: 336, maxW: "calc(100vw - 64px)" })}>
          <ToastContainer />
        </div>
        <div className={css({ display: { base: "none", md: "block" }, w: 336 })}>
          <AnimatePresence initial={false}>
            {isViewOnly ? null : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={css({ mt: 16 })}
              >
                <CanvasActions />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {!supportsTouch && !isViewOnly && isDebugEnabled && <DebugOverlay />}
    </>
  );
}

function DebugOverlay() {
  const [lastPoint, setLastPoint] = useState<Point>({ x: 0, y: 0 });

  useMousePositionListener((point) => {
    setLastPoint(point);
  });

  return (
    <div
      className={flex({
        position: "absolute",
        top: { base: 12, md: 16 },
        right: { base: 12, md: 16 },
        bg: "toast",
        color: "text.secondary",
        textStyle: "body.sm.bold",
        shadow: "md",
        px: 16,
        py: 12,
        rounded: "full",
        gap: 8,
      })}
    >
      <div className={flex({ gap: 2 })}>
        x : <div className={pointText}>{lastPoint.x}</div>
      </div>
      <div className={flex({ gap: 2 })}>
        y : <div className={pointText}>{lastPoint.y}</div>
      </div>
    </div>
  );
}

const pointText = css({ color: "text", minW: "4ch", textAlign: "center" });
