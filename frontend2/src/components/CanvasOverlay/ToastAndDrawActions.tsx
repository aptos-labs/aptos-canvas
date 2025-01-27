import { AnimatePresence, motion } from "framer-motion";
import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { CanvasActions } from "../CanvasActions";
import { ToastContainer } from "../Toast";

export interface ToastAndDrawActions {
  isViewOnly: boolean;
}

export function ToastAndDrawActions({ isViewOnly }: ToastAndDrawActions) {
  return (
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
  );
}
