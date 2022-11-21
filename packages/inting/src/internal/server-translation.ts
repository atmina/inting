import DataLoader from "dataloader";

import {
  // @ts-ignore: React Next
  cache,
} from "react";

import type { GetNamespace, GetTranslations } from "../config";

export const getLoader = cache(
  (
    locale: string,
    getTranslations: GetTranslations,
    getStaticNamespace: GetNamespace
  ) =>
    new DataLoader<string, string>((keys) =>
      getTranslations(locale, keys, getStaticNamespace)
    )
);
