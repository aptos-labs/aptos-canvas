// Copyright © Aptos
// SPDX-License-Identifier: Apache-2.0

import { css, cx } from "styled-system/css";

export interface ChevronIconProps extends React.SVGProps<SVGSVGElement> {
  direction: "left" | "right" | "up" | "down";
}

export function ChevronIcon({ direction, className, ...props }: ChevronIconProps) {
  const directionStyles = css({
    transition: "transform token(durations.1) ease",
    transform:
      direction === "left"
        ? "rotate(180deg)"
        : direction === "up"
        ? "rotate(-90deg)"
        : direction === "down"
        ? "rotate(90deg)"
        : "rotate(0deg)",
  });

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={cx(directionStyles, className)}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.62779 3.16688L10.6667 8.50021L5.62779 13.8335L4.66666 12.8162L8.74439 8.50021L4.66666 4.18418L5.62779 3.16688Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.62779 2.98486L10.8386 8.50021L5.62779 14.0156L4.49469 12.8162L8.57243 8.50021L4.49469 4.18418L5.62779 2.98486ZM4.83862 4.18418L8.91636 8.50021L4.83862 12.8162L5.62779 13.6515L10.4947 8.50021L5.62779 3.34889L4.83862 4.18418Z"
        fill="currentColor"
      />
    </svg>
  );
}
