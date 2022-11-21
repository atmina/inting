import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve, relative, isAbsolute } from "node:path";
import { requireModule } from "@boost/module";
import type { IntingConfig, Namespace, StaticContext } from "./config";

const CONFIG_FILES = [
  "inting.config.ts",
  "inting.config.mjs",
  "inting.config.js",
];

const SERVER_TEMPLATE_FILENAME = "./templates/server.template.ts";
const SHARED_TEMPLATE_FILENAME = "./templates/shared.template.ts";
const TYPES_TEMPLATE_FILENAME = "./templates/types.template.ts";
const LINK_TEMPLATE_FILENAME = "./templates/link.template.ts";
const MIDDLEWARE_TEMPLATE_FILENAME = "./templates/middleware.template.ts";

const ellipsize = (s: string, length: number) => {
  if (s.length > length) {
    return s.substring(0, length) + "...";
  }
  return s;
};

export const main = async () => {
  // const cliFileName = import.meta.url.split("file:///")[1];
  const cliFileName = __filename;
  const { findUp } = await import("find-up");
  const configPath = await findUp(CONFIG_FILES);

  if (!configPath) {
    console.error("Could not locate config.");
    return;
  }

  const rootDir = dirname(configPath);
  const { default: config } = requireModule(configPath) as {
    default: IntingConfig;
  };

  const localeConfig = {
    locales: config.locales,
    defaultLocale: config.defaultLocale,
    implicitDefaultLocale: config.implicitDefaultLocale ?? true,
    cookieName: config.cookieName ?? "NEXT_LOCALE",
    setCookie: config.setCookie ?? false,
    trailingSlash: config.trailingSlash ?? false,
  };

  const outDir = isAbsolute(config.outDir)
    ? config.outDir
    : resolve(rootDir, config.outDir);

  const staticContext: StaticContext = {
    outDir,
    rootDir,
    locales: config.locales,
    defaultLocale: config.defaultLocale,
  };

  const { getStaticNamespaces, getStaticKeys } = config;

  await mkdir(outDir, { recursive: true });
  const cliDir = dirname(cliFileName);

  const serverTemplate = await readFile(
    resolve(cliDir, SERVER_TEMPLATE_FILENAME),
    "utf-8"
  );
  const sharedTemplate = await readFile(
    resolve(cliDir, SHARED_TEMPLATE_FILENAME),
    "utf-8"
  );
  const keysTemplate = await readFile(
    resolve(cliDir, TYPES_TEMPLATE_FILENAME),
    "utf-8"
  );
  const middlewareTemplate = await readFile(
    resolve(cliDir, MIDDLEWARE_TEMPLATE_FILENAME),
    "utf-8"
  );
  const linkTemplate = await readFile(
    resolve(cliDir, LINK_TEMPLATE_FILENAME),
    "utf-8"
  );

  const staticNamespaceMap: Record<string, string> = {};
  let namespaces: Record<string, Namespace>;

  const { default: filenamify } = await import("filenamify");

  if (getStaticNamespaces) {
    namespaces = await getStaticNamespaces(staticContext);
    for (const [key, namespace] of Object.entries(namespaces)) {
      const namespaceFilename = filenamify(key);
      const namespacePath = join(outDir, "static", namespaceFilename);
      await mkdir(dirname(namespacePath), { recursive: true });
      await writeGeneratedFile(
        namespacePath + ".ts",
        `export default ${JSON.stringify(namespace)};`
      );
      staticNamespaceMap[key] = `./${relative(outDir, namespacePath).replaceAll(
        "\\",
        "/"
      )}`;
    }
  } else {
    namespaces = {};
  }

  let keyType: string | undefined;
  const keys = getStaticKeys
    ? await getStaticKeys(staticContext, namespaces)
    : [];

  const formatKey = ({
    key,
    description,
  }: {
    key: string;
    description?: string;
  }) => {
    let s = `  "${key}": string,`;
    if (description) {
      s = `  /** ${ellipsize(description, 300)} */\n${s}`;
    }
    return s;
  };

  if (keys.length > 0) {
    keyType = `
export type Translations = {
${keys.map(formatKey).join("\n")}
}

export type TranslationKey = keyof Translations;
`.trim();
  }

  const configImportPath = `./${relative(outDir, configPath).replaceAll(
    "\\",
    "/"
  )}`;

  const compiledServerTranslations = serverTemplate
    .replace(/\/\* __CONFIG_IMPORT_PATH__ \*\//, configImportPath)
    .replace(
      / *\/\* __STATIC_NAMESPACES__ \*\//,
      Object.entries(staticNamespaceMap)
        .map(
          ([key, path]) =>
            `      case "${key}":\n        return import("${path}");`
        )
        .join("\n")
    );

  const localeType = config.locales
    .map((locale) => JSON.stringify(locale))
    .join(" | ");
  const compiledTypes = (
    keyType
      ? keysTemplate.replace(/\/\* __KEY_TYPE__ \*\/\s*\n[^\n]*$/m, keyType)
      : keysTemplate
  ).replace(/"\/\* __LOCALE_TYPE__ \*\/"/, localeType);

  const compiledMiddleware = middlewareTemplate.replace(
    /\/\* __MIDDLEWARE_OPTIONS__ \*\//,
    "..." + JSON.stringify(localeConfig)
  );

  const compiledLink = linkTemplate.replace(
    /\/\* __DEFAULT_LOCALE__ \*\//,
    config.defaultLocale
  );

  await writeGeneratedFile(
    join(outDir, "server.ts"),
    compiledServerTranslations
  );

  const compiledShared = sharedTemplate.replace(
    /\/\* __LOCALE_CONFIG__ \*\//,
    "..." + JSON.stringify(localeConfig)
  );

  await writeGeneratedFile(join(outDir, "shared.ts"), compiledShared);

  await writeGeneratedFile(join(outDir, "types.ts"), compiledTypes);

  await writeGeneratedFile(join(outDir, "middleware.ts"), compiledMiddleware);

  await writeGeneratedFile(join(outDir, "link.ts"), compiledLink);
};

const writeGeneratedFile = async (path: string, contents: string) => {
  const s =
    "/* eslint-disable */\n// noinspection DuplicatedCode\n\n// Generated code - changes may be overwritten\n\n" +
    contents.replaceAll(/\/\/\s*@ts-expect-error:\s*generated file.*$/gim, "");
  await writeFile(path, s, "utf-8");
};
