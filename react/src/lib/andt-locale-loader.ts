import { Locale } from "antd/es/locale";
import L from "./L";

export async function loadLocale(lang: string): Promise<Locale> {
  const localeName = lang.replace("-", "");
  const antdLocaleMap: Record<string, () => Promise<{ default: Locale }>> = {
    en: () => import("antd/locale/en_US"),
    enGB: () => import("antd/locale/en_GB"),
    ar: () => import("antd/locale/ar_EG"),
    de: () => import("antd/locale/de_DE"),
    it: () => import("antd/locale/it_IT"),
    fr: () => import("antd/locale/fr_FR"),
    ptBR: () => import("antd/locale/pt_BR"),
    tr: () => import("antd/locale/tr_TR"),
    ru: () => import("antd/locale/ru_RU"),
    zhHans: () => import("antd/locale/zh_CN"),
    esMX: () => import("antd/locale/es_ES"),
    es: () => import("antd/locale/es_ES"),
    vi: () => import("antd/locale/vi_VN"),
    nl: () => import("antd/locale/nl_NL"),
    th: () => import("antd/locale/th_TH"),
  };

  const module = await (antdLocaleMap[localeName] || antdLocaleMap["en"])();
  const antdLocale = module.default;

  return {
    ...antdLocale,
    Modal: {
      ...antdLocale.Modal,
      okText: L("Yes"),
      cancelText: L("Cancel"),
      justOkText: L("Ok"),
    },
  };
}
