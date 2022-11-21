import { LocaleLink } from "../../__generated__/link";
import { useTranslation } from "../../__generated__/server";

const Page = () => {
  const t = useTranslation();

  return (
    <>
      <h1>{t("home.title")}</h1>
      {t("home.content")}
      <div>
        <LocaleLink href="/about">{t("about.title")}</LocaleLink>
        {" / "}
        <LocaleLink href="/counter">{t("counter.title")}</LocaleLink>
      </div>
    </>
  );
};

export default Page;
