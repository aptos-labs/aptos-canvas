export interface RgbaColor {
  /** Red value ranging from 0 to 255 */
  red: number;
  /** Green value ranging from 0 to 255 */
  green: number;
  /** Blue value ranging from 0 to 255 */
  blue: number;
  /** Alpha value ranging from 0 to 1 */
  alpha: number;
  /** Optional name of color */
  name?: string;
  /** The CSS value of the color */
  value: string;
}

export function rgba(args: {
  r: number;
  g: number;
  b: number;
  a?: number;
  name?: string;
}): RgbaColor {
  const { r: red, g: green, b: blue, name } = args;
  const alpha = args.a ?? 1;

  return {
    red,
    green,
    blue,
    alpha,
    name,
    value: `rgba(${red}, ${green}, ${blue}, ${alpha})`,
  };
}
