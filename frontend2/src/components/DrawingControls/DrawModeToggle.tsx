"use client";

import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { useCanvasState } from "@/contexts/canvas";

import { Button } from "../Button";
import { EditBoxIcon } from "../Icons/EditBoxIcon";
import { EyeIcon } from "../Icons/EyeIcon";

export function DrawModeToggle() {
  const isDrawing = useCanvasState((s) => s.isDrawing);

  return (
    <div className={stack({ gap: 16, align: "center" })}>
      <Button
        iconOnly
        aria-label={isDrawing ? "Back to View Only" : "Go to Draw Mode"}
        onClick={() => {
          useCanvasState.setState({ isDrawing: !isDrawing });
        }}
      >
        {isDrawing ? <EyeIcon /> : <EditBoxIcon />}
      </Button>
      <div
        aria-hidden="true"
        className={css({
          textStyle: "body.sm.regular",
          textAlign: "center",
          opacity: 0.4,
        })}
      >
        {isDrawing ? (
          <>
            Back to <br /> View Only
          </>
        ) : (
          <>
            Go to <br /> Draw Mode
          </>
        )}
      </div>
    </div>
  );
}
