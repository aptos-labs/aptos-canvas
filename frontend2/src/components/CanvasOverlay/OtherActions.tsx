import { stack } from "styled-system/patterns";

import { emitCanvasCommand } from "@/contexts/canvas";

import { Button } from "../Button";
import { RefreshIcon } from "../Icons/RefreshIcon";

export function OtherActions() {
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
