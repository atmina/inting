// noinspection DuplicatedCode

"use client";

// @ts-ignore: Generated file
import { useLocale } from "@atmina/inting";
// @ts-ignore: Generated file
import { getLocaleLinkProps } from "@atmina/inting/dist/internal/locale-link.js";
import Link from "next/link";
import { createElement, FC, ForwardRefExoticComponent } from "react";
// @ts-expect-error: Generated file
import { LOCALE_CONFIG } from "./shared";

export type LocaleLinkProps = Omit<
  typeof Link extends ForwardRefExoticComponent<infer T> ? T : never,
  "href" | "as" | "locale"
> & {
  // Simplify API to use strings only instead of URL objects
  // TODO: provide a way to switch the locale while keeping everything else
  // intact.
  href: string;
  as?: string;
  // Remove ability to disable appending locale with `locale = false`; if that
  // is needed, just use the regular Link.
  locale?: string;
};

export const LocaleLink: FC<LocaleLinkProps> = ({
  locale: localeProp,
  href,
  as,
  ...rest
}) => {
  const currentLocale = useLocale();
  const locale = localeProp ?? currentLocale;

  return createElement(Link, {
    // Note: locale is useless in Next/Link when AppRouter is used - its
    // prefetch() does not take a locale option so there is no point in passing
    // it here.
    ...rest,
    ...getLocaleLinkProps(
      href,
      as,
      locale,
      LOCALE_CONFIG.implicitDefaultLocale
        ? LOCALE_CONFIG.defaultLocale
        : undefined
    ),
  });
};

if (process.env.NODE_ENV !== "production") {
  LocaleLink.displayName = "LocaleLink";
}
