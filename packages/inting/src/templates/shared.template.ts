// @ts-ignore: Generated file
import type { IntingConfig } from "@atmina/inting";
// @ts-ignore: Generated file
import { addLocaleImpl } from "@atmina/inting/dist/internal/locale-link.js";
import type { FC } from "react";

// @ts-expect-error: Generated file
import { TranslationKey } from "./types";

export const LOCALE_CONFIG: Required<
  Pick<
    IntingConfig,
    "locales" | "defaultLocale" | "implicitDefaultLocale" | "cookieName"
  >
> = {
  /* __LOCALE_CONFIG__ */
} as any;

export type TranslatableFunctionComponentProps<
  TProps extends {} = {},
  TKey extends TranslationKey = TranslationKey
> = TProps & { t: { [k in TKey]: string } };

export type TranslatableFunctionComponent<
  TProps extends {} = {},
  TKeys extends readonly TranslationKey[] = []
> = FC<TranslatableFunctionComponentProps<TProps, TKeys[number]>> & {
  __translationKeys?: TKeys;
};

export type TFC<
  TProps extends {} = {},
  TKeys extends readonly TranslationKey[] = []
> = TranslatableFunctionComponent<TProps, TKeys>;

export const createClientTranslation = <
  TTranslation extends readonly TranslationKey[]
>(
  t: TTranslation
) => t;

export const addLocale = (path: string, locale: string) => {
  return addLocaleImpl(
    path,
    locale,
    LOCALE_CONFIG.implicitDefaultLocale
      ? LOCALE_CONFIG.defaultLocale
      : undefined
  );
};
