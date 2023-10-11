"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { createEntryPayload } from "@thalalabs/surf";
import { flex } from "styled-system/patterns";

import { ABI } from "@/constants/abi";
import { APP_CONFIG } from "@/constants/config";
import { emitCanvasCommand, useCanvasState } from "@/contexts/canvas";
import { useAptosNetworkState } from "@/contexts/wallet";

import { Button } from "../Button";

export function CanvasActions() {
  const network = useAptosNetworkState((s) => s.network);
  const { signAndSubmitTransaction } = useWallet();
  const setViewOnly = useCanvasState((s) => s.setViewOnly);
  const pixelsChanged = useCanvasState((s) => s.pixelsChanged);
  const changedPixelsCount = Object.keys(pixelsChanged).length;

  const cancel = () => {
    setViewOnly(true);
  };

  const clear = () => {
    emitCanvasCommand("clearChangedPixels");
  };

  const finishDrawing = async () => {
    const xs = [];
    const ys = [];
    const rs = [];
    const gs = [];
    const bs = [];
    for (const pixelChanged of Object.values(pixelsChanged)) {
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
    await signAndSubmitTransaction({
      type: "entry_function_payload",
      ...payload,
    });
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
      <Button variant="primary" disabled={!changedPixelsCount} onClick={finishDrawing}>
        Finish Drawing
      </Button>
    </div>
  );
}
