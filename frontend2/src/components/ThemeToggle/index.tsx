"use client";

import { css } from "styled-system/css";

import { SunIcon } from "../Icons/SunIcon";
import { toast } from "../Toast";

// TODO: Implement actual theme toggle logic

export function ThemeToggle() {
  return (
    <button
      className={css({ cursor: "pointer", color: "text" })}
      onClick={() => {
        toast({
          id: "theme-not-implemented",
          variant: "warning",
          content: "Sorry, dark mode coming soon",
        });
      }}
    >
      <SunIcon />
    </button>
  );
}
