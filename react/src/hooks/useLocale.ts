import { useCallback } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { changeLanguage as changeLanguageImpl } from "@/lib/change-language";

export const useLocale = () => {
  const localeState = useSelector((s: RootState) => s.locale);

  const changeLanguage = useCallback((lang: string) => {
    void changeLanguageImpl(lang);
  }, []);

  return { ...localeState, changeLanguage };
};
