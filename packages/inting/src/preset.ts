import type { IntingConfig } from "./config";

export type IntingPreset = Pick<
  IntingConfig,
  "getTranslations" | "getStaticNamespaces" | "getStaticKeys"
>;
