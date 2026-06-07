import { useMemo } from "react";
import { useSession } from "./useSession";

export const useCurrencySign = (): string => {
  const { application } = useSession();
  const currencySign = useMemo(
    () => application?.currencySign ?? "$",
    [application?.currencySign],
  );
  return currencySign;
};

export default useCurrencySign;
