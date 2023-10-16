export type TupleIndices<T extends ReadonlyArray<unknown>> = Extract<
  keyof T,
  `${number}`
> extends `${infer N extends number}`
  ? N
  : never;
