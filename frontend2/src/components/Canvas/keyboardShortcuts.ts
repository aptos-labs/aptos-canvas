import { useEffect } from "react";
import { KeyBindingMap, tinykeys } from "tinykeys";

import { STROKE_COLORS } from "@/constants/canvas";
import { emitCanvasCommand, useCanvasState } from "@/contexts/canvas";
import { TupleIndices } from "@/utils/types";

export function useKeyboardShortcuts(isViewOnly: boolean) {
  useEffect(() => {
    const shortcuts: KeyBindingMap = {};

    if (!isViewOnly) {
      shortcuts["$mod+Z"] = () => {
        emitCanvasCommand("undoLastChange");
      };
    }

    shortcuts.R = () => {
      emitCanvasCommand("resetView");
    };

    for (let n = 1; n <= 8; n++) {
      shortcuts[`Digit${n}`] = () => {
        useCanvasState.setState({ strokeColor: (n - 1) as TupleIndices<typeof STROKE_COLORS> });
      };
    }
    for (let n = 1; n <= 8; n++) {
      shortcuts[`Shift+Digit${n}`] = () => {
        useCanvasState.setState({ strokeWidth: n });
      };
    }

    const unsubscribe = tinykeys(window, shortcuts);
    return () => {
      unsubscribe();
    };
  }, [isViewOnly]);
}
