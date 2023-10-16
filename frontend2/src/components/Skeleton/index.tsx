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
      "linear-gradient(90deg, token(colors.skeleton.shimmer1) 0%, token(colors.skeleton.shimmer2) 20%, token(colors.skeleton.shimmer3) 60%, token(colors.skeleton.shimmer1))",
    animation: "shimmer 2s infinite",
    content: "''",
  },
});
