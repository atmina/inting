import { IntingConfig } from "@atmina/inting";
import { presetFiles } from "@atmina/inting-preset-files";

const config: IntingConfig = {
  locales: ["de", "en"],
  defaultLocale: "en",
  implicitDefaultLocale: true,
  outDir: "./src/__generated__",
  setCookie: true,
  ...presetFiles("./translations"),
};

export default config;
