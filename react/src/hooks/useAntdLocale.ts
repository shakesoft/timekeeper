import { useEffect, useState } from "react";
import { Locale } from "antd/es/locale";
import enUS from "antd/locale/en_US";
import { loadLocale } from "@/lib/andt-locale-loader";

export function useAntdLocale() {
  const currentLang = abp.localization.currentLanguage.name || "en";
  const [antdLocale, setAntdLocale] = useState<Locale>(enUS);

  useEffect(() => {
    loadLocale(currentLang)
      .then((locale) => {
        setAntdLocale(locale);
      })
      .catch(() => {
        setAntdLocale(enUS); // Fallback to default locale
      });
  }, [currentLang]);

  return antdLocale;
}
