"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { stack } from "styled-system/patterns";
import { tinykeys } from "tinykeys";

import { useCanvasState } from "@/contexts/canvas";
import { isServer } from "@/utils/isServer";

import { ExportGraffio } from "../ExportGraffio";
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
      <AnimatePresence>
        {isInitialized ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={stack({
                display: { base: "none", md: "flex" },
                position: "absolute",
                bottom: 24,
                gap: 16,
                "& > button": { shadow: "md" },
              })}
            >
              <div
                className={stack({
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "center",
                  backgroundColor: "white",
                  color: "black",
                  borderRadius: "lg",
                  padding: 24,
                  maxWidth: 320,
                  fontSize: 14,
                  gap: 24,
                })}
              >
                <p>
                  Thanks for participating in Graffio! We have minted a commemorative NFT of this
                  canvas for you. To take it with you, please export your Graffio wallet and import
                  it to another Aptos wallet.
                </p>
                <ExportGraffio />
              </div>
            </motion.div>
            <OtherActions />
          </>
        ) : null}
      </AnimatePresence>
      {!supportsTouch && !isViewOnly && isDebugEnabled && <DebugOverlay />}
    </>
  );
}
