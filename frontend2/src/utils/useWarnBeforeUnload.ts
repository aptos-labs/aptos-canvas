import { useEffect } from "react";

import { isServer } from "./isServer";

export function useWarnBeforeUnload(hasChanges: boolean) {
  useEffect(() => {
    if (isServer() || !hasChanges) return;

    // This will make the browser prompt about unsaved changes
    window.onbeforeunload = () => true;
    return () => {
      window.onbeforeunload = null;
    };
  }, [hasChanges]);
}
