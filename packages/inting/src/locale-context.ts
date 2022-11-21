// TODO: remove when added to main React.
// @ts-ignore
import { createServerContext, Provider, use } from "react";

// Code here gets executed multiple times but React keeps reference to already
// created server contexts and will error if `createServerContext` is called
// again with the same `globalName`. We can't access the context registry
// directly, but we can fake it by keeping a stable reference ourselves.
const stableRef = (createServerContext.__inting ??= {} as any);

export const LocaleContext =
  stableRef.LocaleContext ??
  (stableRef.LocaleContext = createServerContext("inting.locale", null));

export const LocaleProvider = LocaleContext.Provider as Provider<string>;

export const useLocale = (): string => {
  const locale: string | null = use(LocaleContext as any);
  if (!locale) {
    throw new Error("Missing LocaleContext");
  }

  return locale;
};
