"use client";

import { AnimatePresence, motion } from "framer-motion";
import { css } from "styled-system/css";
import { flex, stack } from "styled-system/patterns";

import { CanvasActions } from "@/components/CanvasActions";
import { StrokeColorSelector } from "@/components/DrawingControls/StrokeColorSelector";
import { ExportGraffio } from "@/components/ExportGraffio";
import { EyeIcon } from "@/components/Icons/EyeIcon";
import { useCanvasState } from "@/contexts/canvas";

export function MobileCanvasFooter() {
  const isViewOnly = useCanvasState((s) => s.isViewOnly);

  return (
    <div className={css({ md: { display: "none" } })}>
      <AnimatePresence initial={false} mode="popLayout">
        {isViewOnly ? (
          <motion.div
            key="viewOnly"
            className={stack({ alignItems: "center", gap: 16 })}
            {...transition}
          >
            <div
              className={flex({
                textStyle: "body.sm.regular",
                w: "100%",
                align: "center",
                justify: "center",
                gap: 8,
                py: 8,
              })}
            >
              <EyeIcon />
              View Only
            </div>
            <ExportGraffio />
          </motion.div>
        ) : (
          <motion.div
            key="drawTools"
            className={stack({ alignItems: "center", gap: 16 })}
            {...transition}
          >
            <StrokeColorSelector direction="row" className={css({ py: 8 })} />
            <CanvasActions />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const transition = {
  initial: { transform: "translateY(128px)" },
  animate: { transform: "translateY(0px)" },
  exit: { transform: "translateY(128px)" },
};
