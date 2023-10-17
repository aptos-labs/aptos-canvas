import { useEffect } from "react";
import { KeyBindingMap, tinykeys } from "tinykeys";

import { STROKE_COLORS } from "@/constants/canvas";
import { useCanvasState } from "@/contexts/canvas";
import { TupleIndices } from "@/utils/types";

export function useKeyboardShortcuts() {
  useEffect(() => {
    const shortcuts: KeyBindingMap = {};

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
  }, []);
}
