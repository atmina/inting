import { acceptLanguage } from "next/dist/server/accept-header";
import { ResponseCookie } from "next/dist/server/web/spec-extension/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { IntingConfig } from "../config";

// Note: we don't pass the entire config here, since the callbacks may be using
// Node APIs that aren't available on the edge runtime.
type CreateI18nMiddlewareOptions = Required<
  Pick<
    IntingConfig,
    | "locales"
    | "defaultLocale"
    | "implicitDefaultLocale"
    | "cookieName"
    | "setCookie"
    | "trailingSlash"
  >
>;

const skipPattern = /^\/(?:api|_next|favicon.ico)(?:\/|$)/;

export const createI18nMiddleware = ({
  locales,
  defaultLocale,
  implicitDefaultLocale,
  cookieName,
  setCookie,
  trailingSlash,
}: CreateI18nMiddlewareOptions) => {
  const localesPattern = locales.join("|");
  const withLocalePattern = new RegExp(`^\/(${localesPattern})(?:\/|$)`);

  return (req: NextRequest) => {
    const { url } = req;
    const { pathname, search } = new URL(url);

    if (pathname.match(skipPattern)) {
      return NextResponse.next();
    }

    const localeMatch = withLocalePattern.exec(pathname);
    const localeFromUrl = localeMatch ? localeMatch[1] : null;
    const localeFromCookie = req.cookies.get(cookieName)?.value;
    const validLocaleFromCookie =
      localeFromCookie && locales.includes(localeFromCookie);

    const locale =
      localeFromUrl ??
      (validLocaleFromCookie
        ? localeFromCookie
        : acceptLanguage(req.headers.get("accept-language") ?? "", locales) ??
          defaultLocale);

    const newCookie: ResponseCookie | null =
      setCookie && localeFromCookie !== locale
        ? {
            path: "/",
            name: cookieName,
            maxAge: typeof setCookie === "number" ? setCookie : 31536000,
            value: locale,
          }
        : null;

    if (localeFromUrl) {
      const resp = NextResponse.next();
      if (newCookie) {
        resp.cookies.set(newCookie);
      }

      return resp;
    }

    let newPathname = `/${locale}${pathname}`;

    if (trailingSlash) {
      if (!newPathname.endsWith("/")) {
        newPathname += "/";
      }
    } else {
      if (newPathname.endsWith("/")) {
        newPathname = newPathname.slice(0, newPathname.length - 1);
      }
    }

    // Implicit default locale means we don't redirect, but instead rewrite to
    // provide the locale param.
    const rewrite = implicitDefaultLocale && locale === defaultLocale;

    if (process.env.INTING_DEBUG === "true") {
      const parts = [
        `[inting] Middleware: ${
          rewrite ? "rewrite" : "redirect"
        } ${pathname} => ${newPathname}`,
      ];
      if (localeFromCookie) {
        parts.push(
          `cookie ${cookieName}: ${localeFromCookie} (${
            validLocaleFromCookie ? "valid" : "invalid"
          })`
        );
      } else {
        parts.push(`cookie ${cookieName} unset`);
      }
      console.debug(parts.join(" | "));
    }

    const dest = new URL(newPathname, req.url);
    dest.search = search;

    const resp = (rewrite ? NextResponse.rewrite : NextResponse.redirect)(dest);
    if (newCookie) {
      resp.cookies.set(newCookie);
    }

    return resp;
  };
};
