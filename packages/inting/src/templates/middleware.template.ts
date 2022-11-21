// @ts-ignore: Generated file
import { createI18nMiddleware } from "@atmina/inting/dist/internal/middleware.js";

const options = {
  /* __MIDDLEWARE_OPTIONS__ */
} as any;

export const middleware = createI18nMiddleware(options);

const rxLocaleSegment = new RegExp(`^/(?:${options.locales.join("|")})(?:/|$)`);

export const getLocalelessPath = (url: string) => {
  const path = url.startsWith("/") ? url : new URL(url).pathname;
  return path.replace(rxLocaleSegment, "") || "/";
};
