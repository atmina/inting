export interface StaticContext {
  outDir: string;
  rootDir: string;
  locales: string[];
  defaultLocale: string;
}

export type Namespace = Record<string, string>;

export type GetNamespace = (ns: string) => Promise<Namespace>;

export type GetStaticNamespaces = (
  context: StaticContext
) => Promise<Record<string, Namespace>>;

export type GetStaticKeys = (
  context: StaticContext,
  namespaces: Record<string, Namespace>
) => Promise<{ key: string; description?: string }[]>;

export type GetTranslations = (
  locale: string,
  keys: readonly string[],
  getNamespace: GetNamespace
) => Promise<string[]>;

export interface IntingConfig {
  locales: string[];
  defaultLocale: string;
  implicitDefaultLocale?: boolean;
  outDir: string;
  getTranslations: GetTranslations;
  getStaticNamespaces?: GetStaticNamespaces;
  getStaticKeys?: GetStaticKeys;
  cookieName?: string;
  setCookie?: boolean | number;
  trailingSlash?: boolean;
}
