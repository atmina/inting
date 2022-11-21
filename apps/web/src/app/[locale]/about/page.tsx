import { useTranslation } from "../../../__generated__/server";

const ActualPage = (async () => {
  const t = useTranslation();
  const [title, content] = await Promise.all([
    t("about.title"),
    t("about.content"),
  ]);

  return (
    <>
      <h1>{title}</h1>
      <p>{content}</p>
    </>
  );
}) as any;

const Page = async () => {
  return <ActualPage />;
};

export default Page;
