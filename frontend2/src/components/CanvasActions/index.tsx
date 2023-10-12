"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { createEntryPayload } from "@thalalabs/surf";
import { useState } from "react";
import { flex } from "styled-system/patterns";

import { ABI } from "@/constants/abi";
import { APP_CONFIG } from "@/constants/config";
import { emitCanvasCommand, useCanvasState } from "@/contexts/canvas";
import { useAptosNetworkState } from "@/contexts/wallet";

import { Button } from "../Button";
import { toast } from "../Toast";

export function CanvasActions() {
  const network = useAptosNetworkState((s) => s.network);
  const { signAndSubmitTransaction } = useWallet();
  const setViewOnly = useCanvasState((s) => s.setViewOnly);
  const pixelsChanged = useCanvasState((s) => s.pixelsChanged);
  const changedPixelsCount = pixelsChanged.size;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cancel = () => {
    setViewOnly(true);
  };

  const clear = () => {
    emitCanvasCommand("clearChangedPixels");
  };

  const finishDrawing = async () => {
    setIsSubmitting(true);

    const xs = [];
    const ys = [];
    const rs = [];
    const gs = [];
    const bs = [];
    for (const pixelChanged of pixelsChanged.values()) {
      xs.push(pixelChanged.x);
      ys.push(pixelChanged.y);
      rs.push(pixelChanged.r);
      gs.push(pixelChanged.g);
      bs.push(pixelChanged.b);
    }
    const payload = createEntryPayload(ABI, {
      function: "draw",
      type_arguments: [],
      arguments: [APP_CONFIG[network].canvasTokenAddr, xs, ys, rs, gs, bs],
    }).rawPayload;

    try {
      await signAndSubmitTransaction({
        type: "entry_function_payload",
        ...payload,
      });
      const { optimisticUpdates } = useCanvasState.getState();
      const newOptimisticUpdates = [...optimisticUpdates].concat({
        imagePatch: pixelsChanged,
        committedAt: Date.now(),
      });
      useCanvasState.setState({
        pixelsChanged: new Map(),
        optimisticUpdates: newOptimisticUpdates,
      });
      toast({ id: "add-success", variant: "success", content: "Added!" });
    } catch {
      toast({
        id: "add-failure",
        variant: "error",
        content: "Error occurred. Please check your wallet connection and try again.",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div
      className={flex({
        gap: 16,
        w: "100%",
        "& > button": { flex: 1 },
      })}
    >
      {changedPixelsCount ? (
        <Button variant="secondary" onClick={clear}>
          Clear
        </Button>
      ) : (
        <Button variant="secondary" onClick={cancel}>
          Cancel
        </Button>
      )}
      <Button
        variant="primary"
        disabled={!changedPixelsCount}
        loading={isSubmitting}
        onClick={finishDrawing}
      >
        Submit Drawing
      </Button>
    </div>
  );
}
