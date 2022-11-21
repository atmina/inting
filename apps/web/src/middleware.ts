import { middleware } from "./__generated__/middleware";

export { middleware };

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - favicon.ico (favicon file)
   * Note: These patterns are NOT excluded in the default middleware config.
   */
  matcher: "/((?!api|_next/static|favicon.ico).*)",
};
