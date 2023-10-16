"use client";

import { AnimatePresence, motion } from "framer-motion";
import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { DrawModeToggle } from "@/components/DrawingControls/DrawModeToggle";
import { PaintInfo } from "@/components/DrawingControls/PaintInfo";
import { StrokeColorSelector } from "@/components/DrawingControls/StrokeColorSelector";
import { StrokeWidthSelector } from "@/components/DrawingControls/StrokeWidthSelector";
import { EyeIcon } from "@/components/Icons/EyeIcon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCanvasState } from "@/contexts/canvas";

export function DesktopSidePanel() {
  const isViewOnly = useCanvasState((s) => s.isViewOnly);

  const divider = <div className={css({ w: 48, h: 1, bg: "border", rounded: "full" })} />;

  return (
    <aside className={wrapper}>
      <section className={section}>
        <DrawModeToggle />
        {divider}
        <AnimatePresence initial={false} mode="popLayout">
          {isViewOnly ? (
            <motion.div
              key="viewOnly"
              className={stack({ align: "center", gap: 16, color: "text" })}
              {...transition}
            >
              <EyeIcon />
              <div
                className={css({ textStyle: "body.sm.regular", textAlign: "center", opacity: 0.4 })}
              >
                View <br /> Only
              </div>
            </motion.div>
          ) : (
            <motion.div key="drawTools" className={section} {...transition}>
              <PaintInfo direction="column" />
              {divider}
              <StrokeColorSelector direction="column" />
              {divider}
              <StrokeWidthSelector />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      <section className={section}>
        <ThemeToggle />
      </section>
    </aside>
  );
}

const wrapper = stack({
  display: "none",
  md: { display: "flex" },
  justify: "space-between",
  align: "center",
  w: 96,
  gap: 48,
  bg: "surface",
  height: "100%",
  overflow: "auto",
  px: 16,
  py: 40,
  borderTopRightRadius: "2xl",
  borderBottomRightRadius: "2xl",
});

const section = stack({ gap: 32, alignItems: "center" });

const transition = {
  initial: { transform: "translateX(-128px)" },
  animate: { transform: "translateX(0px)" },
  exit: { transform: "translateX(-128px)" },
};
