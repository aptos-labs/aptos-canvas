"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AnimatePresence, motion } from "framer-motion";
import { css } from "styled-system/css";
import { flex, stack } from "styled-system/patterns";

import { Button } from "@/components/Button";
import { CanvasActions } from "@/components/CanvasActions";
import { StrokeColorSelector } from "@/components/DrawingControls/StrokeColorSelector";
import { EyeIcon } from "@/components/Icons/EyeIcon";
import { useCanvasState } from "@/contexts/canvas";

export function MobileCanvasFooter() {
  const { connected } = useWallet();
  const isViewOnly = useCanvasState((s) => s.isViewOnly);
  const setViewOnly = useCanvasState((s) => s.setViewOnly);

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
            <Button
              variant="primary"
              onClick={() => {
                setViewOnly(false);
              }}
              disabled={!connected}
              className={css({ w: "100%" })}
            >
              Go to Draw Mode
            </Button>
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
