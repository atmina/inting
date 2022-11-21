# @atmina/inting

A simple type-safe translation micro-framework for server components in Next.js 13+.

## Usage

1. Create an `inting.config.ts` next to your `package.json`.
   
   ```ts
    import { IntingConfig } from "@atmina/inting";
    import { presetFiles } from "@atmina/inting-preset-files";

    const config: IntingConfig = {
        locales: ["en", "de"],
        defaultLocale: "en",
        outDir: "./src/__generated__",
        ...presetFiles('./translations'),
    };

    export default config;
   ```
2. Run `npm/pnpm/yarn inting`
3. Create a layout that wraps your content in a `LocaleProvider`.

   ```tsx
   // app/[locale]/layout.tsx

   import { LocaleProvider } from "../../__generated__/server";
   import { ReactNode } from "react";

   const Layout = ({ params, children }: { params?: any; children: ReactNode }) => {
     if (!params) {
       return null;
     }
   
     return <LocaleProvider value={params.locale}>{children}</LocaleProvider>;
   };

   export default Layout;
   ```
   
4. Consume translations with the `useTranslation` hook. Note that you can only import this in server components.

   ```tsx
   // app/[locale]/page.tsx
   
   import { useTranslation } from "../../__generated__/server";

   const PageContent = async () => {
     const t = useTranslation();
   
     return (
       <>
         <h1>{t("home.title")}</h1>
         <p>{t("home.content")}</p>
       </>
     );
   }
   
   export default () => <PageContent />;
   ```

## Config

### `locales`

An array of locale codes.

### `defaultLocale`

The default locale is treated specially when `implicitDefaultLocale` is enabled.

### `implicitDefaultLocale`

When `true`, the default locale is not prefixed to the path unless explicitly provided.

Default: `true`

### `cookieName`

The cookie that is read when detecting the browser's locale. This takes precedence over `accept-language`. Use it to
persist the user's locale preference.

Default: `"NEXT_LOCALE"`

### `getTranslations(locale, keys, getNamespace)`

Receives the current locale and the requested keys. Returns a `Promise` of strings corresponding to the requested keys.
The order of the returned values must match the order of the keys (if this sounds a lot like a `DataLoader`, that is
because it is).

### `getStaticNamespaces(context)`

Optional. Use this to retrieve resources (e.g. from the local file system or a remote API) to be bundled with your
generated source files. This is invoked when running the `inting` command. A static namespace can be loaded with the
provided function in `getTranslations`.

### `getStaticKeys(context, namespaces)`

Optional. Return an exhaustive list of keys that should be made available for looking up translations. Use this to add
type-checking to your translation keys and provide tooltips in some IDEs such as WebStorm.


## Presets

Presets can be built by creating an object that exposes the same three config API methods described above. These can
simply be added to the final config with spread notation `{...preset(options)}`.

For file-based translations, you can install `@atmina/inting-preset-files` or use it as a basis for your own config.

## Generated modules

| Filename        | Description                                   |
|-----------------|-----------------------------------------------|
| `static/`       | Statically generated namespace files          |
| `types.ts`      | Types of locales and translation keys         |
| `server.ts`     | Server-only code (e.g. `useTranslation` hook) |
| `shared.ts`     | Code for server and client components         |
| `link.ts`       | `LocaleLink`, a wrapper for `next/link`       |
| `middleware.ts` | Middleware implementation                     |

We encourage you to re-export these modules to fit your project's needs and conventions.

## Middleware

Use the generated middleware to enable the following behaviors:

- Detecting locale from the browser's `accept-language` header or a cookie, if provided
- Prefixing the path with the locale if it isn't already present
    - For non-default locales, this is a redirect
    - In the default locale and with `implicitDefaultLocale`, this is a rewrite, concealing the actual path.

This closely mirrors what Next.js does with its built-in i18n support in the `/pages` directory.

Your `middleware.ts` should be located next to the `/pages` directory. Bear in mind that the config is statically
analyzed and must therefore contain only constant values (no imports or function calls).

```ts
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
```

## Client components

Getting translations into client components requires a bit more effort. Note that in client components, any code written
for the server side (including `server.ts`) may not be imported directly. Therefore, the required translation strings
must be retrieved in a parent server component and passed to the client component. 

For simple cases, it may be enough to pass the result of one or more `t(...)` calls via props or children. For
components that depend on multiple translations known in advance, the framework provides a `translateClientComponent`
helper. To use it, first define a set of translation keys required by the client component. It is important to separate
this definition from the actual component code that is contained in the `"use client"` boundary, as it cannot be
imported from server code otherwise.

```tsx
// translations.ts

import { createClientTranslation } from './__generated__/shared';

export const counterTranslation = createClientTranslation(['counter.increment', 'counter.decrement']);

export type CounterTranslation = typeof counterTranslation;
```

The `TFC` (translatable function component) type describes a component that expects these translations to be provided
via a `t` prop, which is just a mapping of keys to values.

```tsx
// counter.tsx  (Logic omitted for brevity)

"use client";

import { TFC } from './__generated__/shared';
import { type CounterTranslation } from './translations';

export const Counter: TFC<{initialValue: number}, CounterTranslation> = ({
  t, // t contains the set of translations provided from the server side
}) => {
  return (
    <div>
      <code>{value}</code>
      <hr />
      <div>
        <button>
          (+) {t["counter.increment"]}
        </button>
        <button>
          (-) {t["counter.decrement"]}
        </button>
      </div>
    </div>
  );
};
```

Finally, on the server side, wrap this component in `translateClientComponent`, which takes care  of retrieving the
necessary translations when the component is rendered.

```tsx
import { Counter } from './counter';
import { counterTranslation } from './translations';
import { translateClientComponent } from "./__generated__/server";

const TranslatedCounter = translateClientComponent(Counter, counterTranslation);
```

## License

MIT