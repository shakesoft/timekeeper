import i18n from "i18next";
import { initReactI18next } from "react-i18next";

void i18n.use(initReactI18next).init({
  resources: {},
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  keySeparator: false,
  returnNull: false,
  returnEmptyString: false,
});

export function injectI18nMessages(
  lang: string,
  messages: Record<string, string>,
) {
  const existing = i18n.getResourceBundle(lang, "translation") || {};
  const merged = { ...existing, ...messages };
  if (!i18n.hasResourceBundle(lang, "translation")) {
    i18n.addResourceBundle(lang, "translation", merged, true, true);
  } else {
    i18n.removeResourceBundle(lang, "translation");
    i18n.addResourceBundle(lang, "translation", merged, true, true);
  }
  if (i18n.language !== lang) i18n.changeLanguage(lang);
}

export default i18n;
