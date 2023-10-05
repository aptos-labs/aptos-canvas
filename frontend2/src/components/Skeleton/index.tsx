import { css, cx } from "styled-system/css";

export interface SkeletonProps {
  className: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cx(skeletonStyles, className)} />;
}

const skeletonStyles = css({
  display: "inline-block",
  position: "relative",
  overflow: "hidden",
  bg: "skeleton",
  _after: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 20%, rgba(255, 255, 255, 0.5) 60%, rgba(255, 255, 255, 0))",
    animation: "shimmer 2s infinite",
    content: "''",
  },
});
