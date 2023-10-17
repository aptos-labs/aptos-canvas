import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { stack } from "styled-system/patterns";

import { emitCanvasCommand } from "@/contexts/canvas";
import { isServer } from "@/utils/isServer";

import { Button } from "../Button";
import { openDesktopControlsModal } from "../ControlsModal";
import { InformationIcon } from "../Icons/InformationIcon";
import { RefreshIcon } from "../Icons/RefreshIcon";

export function OtherActions() {
  const [showDesktopControls, setShowDesktopControls] = useState(false);

  useEffect(() => {
    if (isServer()) return;
    const supportsTouch = "ontouchstart" in document.documentElement;
    setShowDesktopControls(!supportsTouch);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={stack({
        display: { base: "none", md: "flex" },
        position: "absolute",
        bottom: 24,
        right: 24,
        gap: 16,
        "& > button": { shadow: "md" },
      })}
    >
      {showDesktopControls && (
        <Button
          variant="tertiary"
          size="md"
          iconOnly
          rounded
          onClick={() => {
            openDesktopControlsModal();
          }}
        >
          <InformationIcon />
        </Button>
      )}
      <Button
        variant="tertiary"
        size="md"
        iconOnly
        rounded
        onClick={() => {
          emitCanvasCommand("resetView");
        }}
      >
        <RefreshIcon />
      </Button>
    </motion.div>
  );
}
