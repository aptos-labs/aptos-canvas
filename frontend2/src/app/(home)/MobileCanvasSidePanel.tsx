"use client";

import { AnimatePresence, motion } from "framer-motion";
import { css } from "styled-system/css";

import { StrokeWidthSelector } from "@/components/DrawingControls/StrokeWidthSelector";
import { useCanvasState } from "@/contexts/canvas";

export function MobileCanvasSidePanel() {
  const isViewOnly = useCanvasState((s) => s.isViewOnly);

  return (
    <div
      className={css({
        display: "flex",
        md: { display: "none" },
        alignSelf: "center",
        position: "absolute",
        left: 0,
        top: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1,
      })}
    >
      <AnimatePresence initial={false}>
        {isViewOnly ? null : (
          <motion.div
            initial={{ transform: "translateX(-32px)" }}
            animate={{ transform: "translateX(0px)" }}
            exit={{ transform: "translateX(-32px)" }}
          >
            <StrokeWidthSelector />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
