import {
  // @ts-ignore
  cache,
  createElement,
  FC,
  ReactElement,
} from "react";

// @ts-expect-error: Generated file
import { TranslationKey } from "./types";
// @ts-expect-error: Generated file
import { TranslatableFunctionComponent } from "./shared";
// @ts-ignore: Generated file
import { useLocale } from "@atmina/inting";
// @ts-ignore: Generated file
import { getLoader } from "@atmina/inting/dist/internal/server-translation.js";
// @ts-ignore: Generated file
export { LocaleProvider, LocaleContext, useLocale } from "@atmina/inting";

// @ts-ignore
import config from "/* __CONFIG_IMPORT_PATH__ */";

export type TranslationElement = ReactElement & {
  then: Promise<string>["then"];
};

export type TranslateFunction = (
  translationKey: TranslationKey
) => TranslationElement;

const LazyTranslation = async ({
  loader,
  translationKey,
}: {
  loader: any;
  translationKey: string;
}) => {
  return await loader.load(translationKey);
};

// @ts-ignore
const getStaticNamespace = (ns: string): Promise<Record<string, string>> => {
  // noinspection JSVoidFunctionReturnValueUsed
  return (() => {
    switch (ns) {
      /* __STATIC_NAMESPACES__ */
      default:
        throw new Error(`No such namespace: ${ns}`);
    }
    // @ts-ignore
  })().then((module) => module.default);
};

// Helper component for server components to inject translations into
// client components.
export const translateClientComponent = <
  TProps extends {},
  TKeys extends readonly TranslationKey[]
>(
  Component: TranslatableFunctionComponent<TProps, TKeys>,
  translationKeys: TKeys
) => {
  return (async (props: any) => {
    const locale = useLocale();

    const loader = getLoader(
      locale,
      config.getTranslations,
      getStaticNamespace
    );

    const keys = translationKeys as readonly string[];
    const values = (await loader.loadMany(keys)) as (string | Error)[];
    const err = values.find((v) => typeof v !== "string");

    if (err) throw err;

    const t = Object.fromEntries(keys.map((k, i) => [k, values[i]]));

    return createElement(Component as any, { ...props, t });
  }) as unknown as FC<Omit<TProps, "t">>;
};

export const useTranslation = () => {
  const locale = useLocale();

  if (!locale) {
    throw new Error("Missing locale");
  }

  const loader = getLoader(locale, config.getTranslations, getStaticNamespace);

  const t: TranslateFunction = (translationKey) => {
    const then: Promise<string>["then"] = (onfulfilled, onrejected) => {
      return loader.load(translationKey).then(onfulfilled, onrejected);
    };

    return {
      ...createElement(
        LazyTranslation as any,
        { loader, translationKey } as any
      ),
      then,
    };
  };

  return t;
};
