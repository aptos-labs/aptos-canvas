import { stack } from "styled-system/patterns";

import { emitCanvasCommand } from "@/contexts/canvas";

import { Button } from "../Button";
import { openDesktopControlsModal } from "../ControlsModal";
import { InformationIcon } from "../Icons/InformationIcon";
import { RefreshIcon } from "../Icons/RefreshIcon";

export function OtherActions() {
  const supportsTouch = "ontouchstart" in document.documentElement;

  return (
    <div
      className={stack({
        display: { base: "none", md: "flex" },
        position: "absolute",
        bottom: 24,
        right: 24,
        gap: 16,
        "& > button": { shadow: "md" },
      })}
    >
      {!supportsTouch && (
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
    </div>
  );
}
