"use client";

import { AnimatePresence, motion } from "framer-motion";
import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { useCanvasState } from "@/contexts/canvas";

import { EyeIcon } from "../Icons/EyeIcon";
import { SunIcon } from "../Icons/SunIcon";
import { DrawModeToggle } from "./DrawModeToggle";
import { PaintInfo } from "./PaintInfo";
import { StrokeColorSelector } from "./StrokeColorSelector";
import { StrokeWidthSelector } from "./StrokeWidthSelector";

export function SidePanel() {
  const isDrawing = useCanvasState((s) => s.isDrawing);

  const divider = (
    <div className={css({ w: 48, h: 1, bg: "rgba(0, 0, 0, 0.2)", rounded: "full" })} />
  );

  return (
    <aside className={wrapper}>
      <section className={section}>
        <DrawModeToggle />
        {divider}
        <AnimatePresence initial={false} mode="popLayout">
          {isDrawing ? (
            <motion.div key="drawTools" className={section} {...transition}>
              <PaintInfo />
              {divider}
              <StrokeColorSelector />
              {divider}
              <StrokeWidthSelector />
            </motion.div>
          ) : (
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
          )}
        </AnimatePresence>
      </section>
      <section className={section}>
        {/* TODO: Theme toggle */}
        <SunIcon />
      </section>
    </aside>
  );
}

const wrapper = stack({
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
  animate: { transform: "translateX(0%)" },
  exit: { transform: "translateX(-128px)" },
};
