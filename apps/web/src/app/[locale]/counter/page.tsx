import {
  translateClientComponent,
  useTranslation,
} from "../../../__generated__/server";

import { Counter } from "./counter";
import { counterTranslation } from "./counter.translation";

const TranslatedCounter = translateClientComponent(Counter, counterTranslation);

const Page = () => {
  const t = useTranslation();

  return (
    <>
      <h1>{t("counter.title")}</h1>
      <TranslatedCounter initialValue={3} />
    </>
  );
};

export default Page;
