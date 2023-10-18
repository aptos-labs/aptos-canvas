"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { createEntryPayload } from "@thalalabs/surf";
import { useEffect, useState } from "react";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

import { ABI } from "@/constants/abi";
import { APP_CONFIG } from "@/constants/config";
import { aggregatePixelsChanged, emitCanvasCommand, useCanvasState } from "@/contexts/canvas";
import { useAptosNetworkState } from "@/contexts/wallet";

import { Button } from "../Button";
import { EyeIcon } from "../Icons/EyeIcon";
import { toast } from "../Toast";

export function CanvasActions() {
  const network = useAptosNetworkState((s) => s.network);
  const { signAndSubmitTransaction } = useWallet();
  const setViewOnly = useCanvasState((s) => s.setViewOnly);
  const currentChanges = useCanvasState((s) => s.currentChanges);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coolDownLeft, setCoolDownLeft] = useState<number | null>(null);

  useEffect(() => {
    if (coolDownLeft === null) return;

    const interval = window.setInterval(() => {
      setCoolDownLeft((prev) => {
        if (prev === null) return null;
        const next = prev - 1;
        return next === 0 ? null : next;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [coolDownLeft]);

  const goToViewMode = () => {
    setViewOnly(true);
  };

  const undoLastChange = () => {
    emitCanvasCommand("undoLastChange");
  };

  const finishDrawing = async () => {
    setIsSubmitting(true);

    const pixelsChanged = aggregatePixelsChanged(currentChanges);

    let xs = [];
    let ys = [];
    let colors = [];
    for (const pixelChanged of pixelsChanged.values()) {
      xs.push(pixelChanged.x);
      ys.push(pixelChanged.y);
      colors.push(pixelChanged.color);
    }

    console.log("xs: ", xs.toString());
    console.log("ys: ", ys.toString());
    console.log("colors: ", colors.toString());

    // Petra Logo
    const logoX = [2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,2,3,4,5,2,3,4,5,2,3,4,5,2,3,4,5,2,3,4,5,2,3,4,5,2,3,4,5,2,3,4,5,2,3,4,5,2,3,4,5,2,3,4,5,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6,6,7,7,7,7,8,8,8,8,9,9,9,9,10,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,15,15,15,15,16,16,16,16,17,17,17,17,18,18,18,18,12,13,14,14,14,14,15,14,18,19,19,19,19,20,20,20,20,21,21,21,21,19,20,21,22,22,22,22,23,23,23,23,22,23,19,19,19,20,20,20,21,21,21,22,22,22,20,21,22,23,23,23,23,19,19,19,20,20,21,21,22,22,20,21,22,23,23,23,20,20,21,21,22,22,23,23,20,20,21,21,22,22,23,23,19,19,19,19,20,20,21,21,22,22,23,23,20,20,21,21,22,22,23,23,20,20,21,21,22,22,23,23,17,17,17,17,18,18,18,18,19,19,19,19,14,14,14,14,15,15,15,15,16,16,16,16,12,12,12,12,13,13,13,13,10,10,10,10,11,11,11,11,7,7,7,7,8,8,8,8,9,9,9,9,6,6,6,6,6,6,6,7,7,7,8,8,8,6,6,7,7,8,8,6,6,7,7,8,8,6,6,7,7,8,8,6,6,6,7,7,7,8,8,8,6,6,7,7,8,8,9,9,9,9,10,10,10,10,11,11,11,11,12,12,12,13,13,13,14,14,14,15,15,15,16,16,16,16,17,17,17,17,18,18,18,15,15,16,16,17,17,18,18,15,15,15,16,16,16,17,17,17,18,18,18,15,16,17,18,19,19,19,15,16,17,18,15,15,16,16,17,17,18,18,15,16,17,18,12,12,12,12,13,13,13,13,14,14,14,14,11,11,11,11,9,9,9,9,10,10,10,10,9,9,10,10,11,11,9,10,11,9,10,11,9,9,10,10,11,11,12,12,12,12,13,13,13,13,14,14,14,14,12,12,13,13,14,14,0,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,0,0,0,0,0,23,24,24,24,24,24,24,24,24,24,24,24,24,24,23,24,23,24,23,24]
    const logoY = [3,4,5,6,3,4,5,6,3,4,5,6,3,4,5,6,7,7,7,7,8,8,8,8,9,9,9,9,10,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,17,17,17,17,18,19,20,21,18,19,20,21,18,19,20,21,18,19,20,21,22,23,24,22,23,24,22,23,24,22,23,24,21,22,23,24,21,22,23,24,21,22,23,24,21,22,23,24,21,22,23,24,21,22,23,24,21,22,23,24,21,22,23,24,21,22,23,24,21,22,23,24,21,22,23,24,21,22,23,24,20,20,20,21,22,23,20,24,20,20,21,22,23,20,21,22,23,20,21,22,23,24,24,24,20,21,22,23,20,21,22,23,24,24,17,18,19,17,18,19,17,18,19,17,18,19,16,16,16,16,17,18,19,14,15,16,14,15,14,15,14,15,13,13,13,13,14,15,11,12,11,12,11,12,11,12,9,10,9,10,9,10,9,10,7,8,9,10,7,8,7,8,7,8,7,8,5,6,5,6,5,6,5,6,3,4,3,4,3,4,3,4,3,4,5,6,3,4,5,6,3,4,5,6,3,4,5,6,3,4,5,6,3,4,5,6,3,4,5,6,3,4,5,6,3,4,5,6,3,4,5,6,3,4,5,6,3,4,5,6,3,4,5,6,3,4,5,6,7,8,9,7,8,9,7,8,9,10,11,10,11,10,11,12,13,12,13,12,13,14,15,14,15,14,15,16,17,18,16,17,18,16,17,18,19,20,19,20,19,20,17,18,19,20,17,18,19,20,17,18,19,20,17,18,19,17,18,19,17,18,19,17,18,19,17,18,19,20,17,18,19,20,17,18,19,15,16,15,16,15,16,15,16,12,13,14,12,13,14,12,13,14,12,13,14,11,11,11,11,11,12,13,10,10,10,10,8,9,8,9,8,9,8,9,7,7,7,7,7,8,9,10,7,8,9,10,7,8,9,10,7,8,9,10,7,8,9,10,7,8,9,10,11,12,11,12,11,12,13,13,13,14,14,14,15,16,15,16,15,16,13,14,15,16,13,14,15,16,13,14,15,16,11,12,11,12,11,12,3,4,3,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,16,17,17,18,18,19,19,20,21,22,23,24,23,24,22,21,20,25,24,25,23,22,21,20,19,18,17,16,4,5,3,2,2,1,1,0,0]
    colors = [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1,6,6,6,1,6,6,6,1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1,1,1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6,1,1,1,6,6,6,6,6,6,1,1,6,6,6,6,6,6,1,1,6,6,6,6,6,6,6,6,6,6,1,1,6,6,6,6,6,6,1,1,6,6,6,6,1,6,1,1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1,6,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1,1,1,1,1,6,6,6,6,6,6,6,1,1,6,6,6,6,6,1,1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1,1,1,6,1,1,1,6,6,6,6,1,1,1,1,1,1,1,1,1,1,1,1,6,6,1,1,6,1,1,6,1,1,1,1,6,6,6,6,6,6,1,1,1,6,1,1,1,6,6,6,1,1,1,1,1,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,1,6,6,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]

    // Move Unit Over
    const pointX = xs[0];
    logoX.forEach((x, i) => logoX[i] = x + pointX!);
    const pointY = ys[0];
    logoY.forEach((x, i) => logoY[i] = x + pointY!);
  
    xs = logoX;
    ys = logoY;

    // converter
    // const minX = Math.min(...xs);
    // xs.forEach((x, i) => xs[i] = x - minX);
    // const minY = Math.min(...ys);
    // ys.forEach((y, i) => ys[i] = y - minY);

    // console.log("xs: ", xs.toString());
    // console.log("ys: ", ys.toString());
    

    const payload = createEntryPayload(ABI, {
      function: "draw",
      type_arguments: [],
      arguments: [APP_CONFIG[network].canvasTokenAddr, xs, ys, colors],
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
        currentChanges: [],
        optimisticUpdates: newOptimisticUpdates,
      });
      toast({ id: "add-success", variant: "success", content: "Added!" });
      if (!useCanvasState.getState().canDrawUnlimited) setCoolDownLeft(5);
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
    <div className={flex({ gap: 16, w: "100%" })}>
      <Button
        variant="secondary"
        iconOnly
        onClick={goToViewMode}
        className={css({ md: { display: "none" } })}
      >
        <EyeIcon />
      </Button>
      <Button
        variant="secondary"
        onClick={undoLastChange}
        disabled={!currentChanges.length || isSubmitting}
        className={css({ flex: 1 })}
      >
        Undo
      </Button>
      <Button
        variant="primary"
        disabled={!currentChanges.length || coolDownLeft !== null}
        loading={isSubmitting}
        onClick={finishDrawing}
        className={css({ flex: 1, textWrap: "nowrap" })}
      >
        {coolDownLeft !== null ? `Wait ${coolDownLeft}s` : "Submit Drawing"}
      </Button>
    </div>
  );
}
