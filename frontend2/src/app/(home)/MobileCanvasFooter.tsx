"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { forwardRef } from "react";
import { css } from "styled-system/css";
import { flex, stack } from "styled-system/patterns";

import { Button } from "@/components/Button";
import { CanvasActions } from "@/components/CanvasActions";
import { openConnectWalletModal } from "@/components/ConnectWalletModal/ConnectWalletModal";
import { StrokeColorSelector } from "@/components/DrawingControls/StrokeColorSelector";
import { EndStateContent } from "@/components/EndStateContent";
import { DiscordIcon } from "@/components/Icons/DiscordIcon";
import { EyeIcon } from "@/components/Icons/EyeIcon";
import { DISCORD_CHANNEL } from "@/constants/links";
import { isMintComplete, useCanvasState } from "@/contexts/canvas";

export function MobileCanvasFooter() {
  const { isLoading } = useWallet();
  const isViewOnly = useCanvasState((s) => s.isViewOnly);
  const isInitialized = useCanvasState((s) => s.isInitialized);
  const hasGeneralDrawingEnded = useCanvasState((s) => s.isEventComplete && !s.canDrawUnlimited);
  const showEndState = !isLoading && isInitialized && (hasGeneralDrawingEnded || isMintComplete);

  return (
    <div className={css({ md: { display: "none" } })}>
      <AnimatePresence initial={false} mode="popLayout">
        {showEndState ? (
          <EndState key="endState" />
        ) : isViewOnly ? (
          <ViewOnly key="viewOnly" />
        ) : (
          <DrawTools key="drawTools" />
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

const EndState = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <motion.div ref={ref} className={stack({ alignItems: "center", gap: 16 })} {...transition}>
      <EndStateContent />
    </motion.div>
  );
});
EndState.displayName = "EndState";

const ViewOnly = forwardRef<HTMLDivElement>((_, ref) => {
  const { connected } = useWallet();

  return (
    <motion.div ref={ref} className={stack({ alignItems: "center", gap: 16 })} {...transition}>
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
      <div className={flex({ gap: 16 })}>
        <Button variant="secondary" asChild className={css({ flex: 1 })}>
          <Link
            href={DISCORD_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className={flex({ gap: 8, align: "center", whiteSpace: "nowrap" })}
          >
            <DiscordIcon />
            Join Discussion
          </Link>
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            if (!connected) {
              openConnectWalletModal();
              return;
            }
            useCanvasState.getState().setViewOnly(false);
          }}
          className={css({ flex: 1 })}
        >
          Go to Draw Mode
        </Button>
      </div>
    </motion.div>
  );
});
ViewOnly.displayName = "ViewOnly";

const DrawTools = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <motion.div ref={ref} className={stack({ alignItems: "center", gap: 16 })} {...transition}>
      <StrokeColorSelector direction="row" className={css({ py: 8 })} />
      <CanvasActions />
    </motion.div>
  );
});
DrawTools.displayName = "DrawTools";
