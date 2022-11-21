import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Namespace, IntingPreset } from "@atmina/inting";
import { parse as parseYaml } from "yaml";

const filePattern = /^(.*)\.(\w+)\.(json|ya?ml)$/;

const processDirectory = async (
  namespaces: Record<string, Namespace>,
  dirPath: string
) => {
  const members = await readdir(dirPath, { withFileTypes: true });

  const filenames = members
    .filter((dirent) => dirent.isFile())
    .sort((a, b) => (a.name < b.name ? -1 : 1))
    .map((dirent) => dirent.name);

  for (const filename of filenames) {
    const match = filePattern.exec(filename);

    if (!match) {
      continue;
    }

    const filePath = join(dirPath, filename);
    const [_, namespaceKey, locale, ext] = match as unknown as [
      string,
      string,
      string,
      string
    ];
    const rawData = await readFile(filePath, "utf8");

    let parsedData: Record<string, string>;

    try {
      parsedData = ext === "json" ? JSON.parse(rawData) : parseYaml(rawData);
    } catch (e) {
      console.error(e);
      throw new Error("Error reading file: " + filePath);
    }

    namespaces[namespaceKey + "." + locale] = parsedData;
  }
};

export const presetFiles = (sourceDir: string): IntingPreset => ({
  getStaticNamespaces: async (context) => {
    sourceDir = resolve(context.rootDir, sourceDir);
    const namespaces: Record<string, Namespace> = {};
    await processDirectory(namespaces, sourceDir);
    return namespaces;
  },

  getTranslations: async (locale, keys, getNamespace) => {
    const res: string[] = [];
    const namespaces: Record<string, Namespace> = {};

    if (process.env.INTING_PRESET_DEBUG) {
      console.log("[inting-preset-files] getTranslations", locale, keys);
    }

    for (const key of keys) {
      const periodIndex = key.lastIndexOf(".");
      if (periodIndex === -1) {
        throw new Error(
          `Key must be in the form <namespace>.<member>; got ${key}`
        );
      }
      const namespaceKey = key.slice(0, periodIndex) + "." + locale;
      const memberKey = key.slice(periodIndex + 1);
      const namespace = (namespaces[namespaceKey + "." + locale] ??=
        await getNamespace(namespaceKey));
      const value = namespace[memberKey];
      if (!value) {
        throw new Error(`Cannot find ${locale} translation: ${key}`);
      }
      res.push(value);
    }

    return res;
  },

  getStaticKeys: async (context, namespaces) => {
    return Array.from(
      new Set(
        Object.entries(namespaces).flatMap(([nsKey, namespace]) => {
          const tokens = nsKey.split(".");
          const locale = tokens.pop();
          if (locale !== context.defaultLocale) {
            return [];
          }
          nsKey = tokens.join(".");
          return Object.entries(namespace).map(([key, value]) => ({
            key: `${nsKey}.${key}`,
            description: value,
          }));
        })
      )
    );
  },
});
