import { FC } from "react";
import { useLang } from "./Metronici18n";
import { IntlProvider } from "react-intl";
import "@formatjs/intl-relativetimeformat/polyfill.js";
import "@formatjs/intl-relativetimeformat/locale-data/en.js";
import "@formatjs/intl-relativetimeformat/locale-data/de.js";
import "@formatjs/intl-relativetimeformat/locale-data/es.js";
import "@formatjs/intl-relativetimeformat/locale-data/fr.js";
import "@formatjs/intl-relativetimeformat/locale-data/ja.js";
import "@formatjs/intl-relativetimeformat/locale-data/zh.js";

import deMessages from "./messages/de.json";
import enMessages from "./messages/en.json";
import esMessages from "./messages/es.json";
import frMessages from "./messages/fr.json";
import jaMessages from "./messages/ja.json";
import zhMessages from "./messages/zh.json";
import { WithChildren } from "../helpers";

const allMessages = {
  de: deMessages,
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  ja: jaMessages,
  zh: zhMessages,
};

const I18nProvider: FC<WithChildren> = ({ children }) => {
  const locale = useLang();
  const messages = allMessages[locale];

  return (
    // @ts-ignore - Temporary workaround for a type compatibility issue between React and react-intl
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
};

export { I18nProvider };
