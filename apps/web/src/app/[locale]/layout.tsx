import { ReactNode } from "react";
import { LocaleProvider } from "../../__generated__/server";
import { LOCALE_CONFIG } from "../../__generated__/shared";

const Page = ({ params, children }: { params?: any; children: ReactNode }) => {
  if (!params) {
    return null;
  }
  return (
    <main>
      <code>Params: {JSON.stringify(params)}</code>
      <LocaleProvider value={params.locale}>{children}</LocaleProvider>
    </main>
  );
};

export default Page;

export const generateStaticParams = async () => {
  return LOCALE_CONFIG.locales.map((locale) => ({ locale }));
};

export const dynamicParams = false;
