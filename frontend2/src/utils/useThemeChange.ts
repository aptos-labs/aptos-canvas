import { useEffect } from "react";

export type Theme = "dark" | "light";

export function useThemeChange(onChange: (newTheme: Theme) => void) {
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
          onChange(document.documentElement.dataset.theme as Theme);
        }
      }
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => {
      observer.disconnect();
    };
  }, [onChange]);
}
