import { createClientTranslation } from "../../../__generated__/shared";

export const counterTranslation = createClientTranslation([
  "counter.increment",
  "counter.decrement",
] as const);

export type CounterTranslation = typeof counterTranslation;
