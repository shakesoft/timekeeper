/// <reference types="vite/client" />

import type { AbpUserConfigurationResult } from "./api/abp-user-configuration";
import "../node_modules/abp-web-resources/Abp/Framework/scripts/abp.d.ts";
import "../node_modules/abp-web-resources/Abp/Framework/scripts/libs/abp.jquery.d.ts";
import "../node_modules/abp-web-resources/Abp/Framework/scripts/libs/abp.signalr.d.ts";

// Metronic uses old-style imports for @formatjs locale-data (without .js extension).
// These declarations silence the "Cannot find module" errors for those imports.
declare module "@formatjs/intl-relativetimeformat/locale-data/en" {}
declare module "@formatjs/intl-relativetimeformat/locale-data/de" {}
declare module "@formatjs/intl-relativetimeformat/locale-data/es" {}
declare module "@formatjs/intl-relativetimeformat/locale-data/fr" {}
declare module "@formatjs/intl-relativetimeformat/locale-data/ja" {}
declare module "@formatjs/intl-relativetimeformat/locale-data/zh" {}

declare global {
  interface Window {
    __applyAbpUserConfiguration?: (config: AbpUserConfigurationResult) => void;
    signalR?: typeof signalR;
  }
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
