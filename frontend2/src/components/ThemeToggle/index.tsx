"use client";

import { css } from "styled-system/css";

import { MoonIcon } from "../Icons/MoonIcon";
import { SunIcon } from "../Icons/SunIcon";

export function ThemeToggle() {
  const toggleTheme = () => {
    // Get current color scheme
    let storedScheme: string | null = null;
    try {
      storedScheme = window.localStorage.getItem("color-scheme");
    } catch {
      // There's no good way to handle localStorage failing here
    }
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    // Determine new color scheme
    const currentScheme = storedScheme ?? (mql.matches ? "dark" : "light");
    const newScheme = currentScheme === "light" ? "dark" : "light";

    // Apply new color scheme
    document.documentElement.style.setProperty("color-scheme", newScheme);
    document.documentElement.dataset.theme = newScheme;
    try {
      window.localStorage.setItem("color-scheme", newScheme);
    } catch {
      // There's no good way to handle localStorage failing here
    }
  };

  return (
    <button aria-label="Toggle Theme" onClick={toggleTheme} className={themeToggle}>
      <SunIcon className={sunIcon} aria-hidden />
      <MoonIcon className={moonIcon} aria-hidden />
    </button>
  );
}

const themeToggle = css({
  cursor: "pointer",
  color: "text",
  position: "relative",
  h: 24,
  w: 24,
  "& > svg": {
    position: "absolute",
    inset: 0,
    transition: "opacity token(durations.2) ease, transform token(durations.2) ease",
  },
});

const sunIcon = css({
  _dark: {
    opacity: 0,
    transform: "rotate(-90deg)",
  },
});

const moonIcon = css({
  _light: {
    opacity: 0,
    transform: "rotate(90deg)",
  },
});
