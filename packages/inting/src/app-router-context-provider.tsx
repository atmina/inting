import { AppRouterContext } from "next/dist/shared/lib/app-router-context";
import { FC, ReactNode, useContext } from "react";

export const AppRouterContextProvider: FC<{locale: string, children?: ReactNode}> = ({locale, children}) => {
  const router = useContext(AppRouterContext);

  if (!router) {
    throw new Error('Missing AppRouterContext');
  }

  const wrapped = {
    ...router,
    locale
  }

  return <AppRouterContext.Provider value={wrapped}>{children}</AppRouterContext.Provider>
}
