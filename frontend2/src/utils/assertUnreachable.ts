/**
 * By only accepting a `never` value, this function lets you assert that a block
 * of code is unreachable at build time. If the unreachable block of code is
 * somehow hit during runtime, an error will be thrown.
 *
 * @example
 * // Exhaustive switch statement
 * const value = "foo" as "foo" | "bar" | "baz";
 * switch (value) {
 *   case "foo":
 *     // logic
 *   case "bar":
 *     // logic
 *   case "baz":
 *     // logic
 *   default:
 *     // Throws error during type-checking process
 *     assertUnreachable(value, "Unrecognized value received");
 * }
 */
export const assertUnreachable = (value: never, errorMessage?: string) => {
  throw new Error(errorMessage || `Unreachable value received: ${JSON.stringify(value)}`);
};
