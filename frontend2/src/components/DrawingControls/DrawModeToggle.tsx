"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { css } from "styled-system/css";
import { stack } from "styled-system/patterns";

import { useCanvasState } from "@/contexts/canvas";

import { Button } from "../Button";
import { EditBoxIcon } from "../Icons/EditBoxIcon";
import { EyeIcon } from "../Icons/EyeIcon";

export function DrawModeToggle() {
  const { connected } = useWallet();
  const isViewOnly = useCanvasState((s) => s.isViewOnly);
  const setViewOnly = useCanvasState((s) => s.setViewOnly);

  return (
    <div className={stack({ gap: 16, align: "center" })}>
      <Button
        iconOnly
        aria-label={isViewOnly ? "Go to Draw Mode" : "Back to View Only"}
        disabled={isViewOnly && !connected}
        onClick={() => {
          setViewOnly(!isViewOnly);
        }}
      >
        {isViewOnly ? <EditBoxIcon /> : <EyeIcon />}
      </Button>
      <div
        aria-hidden="true"
        className={css({
          textStyle: "body.sm.regular",
          textAlign: "center",
          opacity: 0.4,
        })}
      >
        {isViewOnly ? (
          <>
            Go to <br /> Draw Mode
          </>
        ) : (
          <>
            Back to <br /> View Only
          </>
        )}
      </div>
    </div>
  );
}
