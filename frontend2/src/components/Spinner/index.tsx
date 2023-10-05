import { css, cx, type RecipeVariantProps, sva } from "styled-system/css";

type SpinnerVariants = NonNullable<RecipeVariantProps<typeof spinnerStyles>>;

export interface SpinnerProps extends SpinnerVariants {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Spinner({ color, size = "md", className }: SpinnerProps) {
  const properties = spinnerProperties[size];
  const styles = spinnerStyles({ color });

  return (
    <svg
      width={properties.size}
      height={properties.size}
      viewBox={`0 0 ${properties.size} ${properties.size}`}
      fill="none"
      className={cx(css({ animation: "spin token(durations.4) linear infinite" }), className)}
    >
      <circle
        cx={properties.size / 2}
        cy={properties.size / 2}
        r={properties.radius}
        strokeWidth="3"
        className={styles.track}
      />
      <path d={properties.pathData} fill="none" strokeWidth="3" className={styles.arc} />
    </svg>
  );
}

const spinnerStyles = sva({
  slots: ["arc", "track"],
  base: { arc: {}, track: {} },
  variants: {
    color: {
      primary: {
        arc: { stroke: "spinner.primary.arc" },
        track: { stroke: "spinner.primary.track" },
      },
      secondary: {
        arc: { stroke: "spinner.secondary.arc" },
        track: { stroke: "spinner.secondary.track" },
      },
      onInteractive: {
        arc: { stroke: "spinner.onInteractive.arc" },
        track: { stroke: "spinner.onInteractive.track" },
      },
    },
  },
  defaultVariants: { color: "primary" },
});

const spinnerProperties: Record<
  NonNullable<SpinnerProps["size"]>,
  { size: number; radius: number; pathData: string }
> = {
  xs: {
    size: 12,
    radius: 4.5,
    pathData: createArc({ x: 6, y: 6, r: 4.5, startAngle: 0, endAngle: 90 }),
  },
  sm: {
    size: 16,
    radius: 6.5,
    pathData: createArc({ x: 8, y: 8, r: 6.5, startAngle: 0, endAngle: 90 }),
  },
  md: {
    size: 20,
    radius: 8.5,
    pathData: createArc({ x: 10, y: 10, r: 8.5, startAngle: 0, endAngle: 90 }),
  },
  lg: {
    size: 28,
    radius: 12.5,
    pathData: createArc({ x: 14, y: 14, r: 12.5, startAngle: 0, endAngle: 90 }),
  },
  xl: {
    size: 36,
    radius: 16.5,
    pathData: createArc({ x: 18, y: 18, r: 16.5, startAngle: 0, endAngle: 90 }),
  },
};

function createArc(args: Record<"x" | "y" | "r" | "startAngle" | "endAngle", number>) {
  const { x, y, r, startAngle, endAngle } = args;

  const start = polarToCartesian({ x, y, r, angle: endAngle });
  const end = polarToCartesian({ x, y, r, angle: startAngle });

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  const pathData = ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");

  return pathData;
}

function polarToCartesian(args: Record<"x" | "y" | "r" | "angle", number>) {
  const angleInRadians = ((args.angle - 90) * Math.PI) / 180;

  return {
    x: args.x + args.r * Math.cos(angleInRadians),
    y: args.y + args.r * Math.sin(angleInRadians),
  };
}
