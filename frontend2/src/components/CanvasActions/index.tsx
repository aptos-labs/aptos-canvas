"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { createEntryPayload } from "@thalalabs/surf";
import { useEffect, useMemo, useState } from "react";
import { css } from "styled-system/css";
import { flex } from "styled-system/patterns";

import { ABI } from "@/constants/abi";
import { APP_CONFIG } from "@/constants/config";
import { aggregatePixelsChanged, emitCanvasCommand, useCanvasState } from "@/contexts/canvas";
import { useAptosNetworkState } from "@/contexts/wallet";

import { Button } from "../Button";
import { EyeIcon } from "../Icons/EyeIcon";
import { removeToast, toast } from "../Toast";

const DISABLED_DRAWING_TOAST_ID = "drawing-disabled";

export function CanvasActions() {
  const network = useAptosNetworkState((s) => s.network);
  const { signAndSubmitTransaction } = useWallet();
  const setViewOnly = useCanvasState((s) => s.setViewOnly);
  const currentChanges = useCanvasState((s) => s.currentChanges);
  const isDrawingEnabled = useCanvasState((s) => s.isDrawingEnabled);
  const canDrawUnlimited = useCanvasState((s) => s.canDrawUnlimited);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coolDownLeft, setCoolDownLeft] = useState<number | null>(null);

  const abi = useMemo(() => ABI(APP_CONFIG[network].canvasAddr), [network]);

  const shouldDisableDrawing = !isDrawingEnabled && !canDrawUnlimited;

  useEffect(() => {
    if (!shouldDisableDrawing) return;

    toast({
      id: DISABLED_DRAWING_TOAST_ID,
      variant: "warning",
      content: "Drawing is temporarily paused",
      duration: null,
    });

    return () => {
      removeToast(DISABLED_DRAWING_TOAST_ID);
    };
  }, [shouldDisableDrawing]);

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

    const xs = [];
    const ys = [];
    const colors = [];
    for (const pixelChanged of pixelsChanged.values()) {
      xs.push(pixelChanged.x);
      ys.push(pixelChanged.y);
      colors.push(pixelChanged.color);
    }

    const payload = createEntryPayload(abi, {
      function: "draw",
      type_arguments: [],
      arguments: [APP_CONFIG[network].canvasTokenAddr, xs, ys, colors],
    }).rawPayload;

    try {
      await signAndSubmitTransaction({
        type: "entry_function_payload",
        ...payload,
      });
      const { optimisticUpdates, coolDownSeconds } = useCanvasState.getState();
      const newOptimisticUpdates = [...optimisticUpdates].concat({
        imagePatch: pixelsChanged,
        committedAt: Date.now(),
      });
      useCanvasState.setState({
        currentChanges: [],
        optimisticUpdates: newOptimisticUpdates,
      });
      toast({ id: "add-success", variant: "success", content: "Added!" });
      if (!canDrawUnlimited) setCoolDownLeft(coolDownSeconds);
    } catch (e) {
      if (typeof e === "string") {
        toast({
          id: "add-failure",
          variant: "error",
          content: `Wallet Error: ${e}.`,
        });
      } else {
        toast({
          id: "add-failure",
          variant: "error",
          content: "Error occurred. Please check your wallet connection and try again.",
        });
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className={flex({ gap: 16, w: "100%", md: { "& > button": { shadow: "md" } } })}>
      <Button
        variant="secondary"
        iconOnly
        aria-label="Back to View Only"
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
        disabled={!currentChanges.length || coolDownLeft !== null || shouldDisableDrawing}
        loading={isSubmitting}
        onClick={finishDrawing}
        className={css({ flex: 1, whiteSpace: "nowrap" })}
      >
        {coolDownLeft !== null ? `Wait ${coolDownLeft}s` : "Submit Drawing"}
      </Button>
    </div>
  );
}
