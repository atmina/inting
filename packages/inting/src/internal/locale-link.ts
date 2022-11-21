import { UrlObject } from "url";
import { addLocale as addLocaleImpl } from "next/dist/shared/lib/router/utils/add-locale";
import { formatUrl } from "next/dist/shared/lib/router/utils/format-url";

export { addLocaleImpl };

export const getLocaleLinkProps = (
  hrefProp: string,
  asProp: string | undefined,
  locale: string,
  defaultLocale?: string
) => {
  const href = addLocaleImpl(hrefProp, locale, defaultLocale);
  const as = asProp && addLocaleImpl(asProp, locale, defaultLocale);

  return {
    href,
    as,
  };
};

export const formatStringOrUrl = (
  urlObjOrString: UrlObject | string
): string => {
  if (typeof urlObjOrString === "string") {
    return urlObjOrString;
  }

  return formatUrl(urlObjOrString);
};
