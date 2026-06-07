import { ExternalLoginProviderInfoModel } from "@/api/generated/service-proxies";

export const ExternalLoginProviders = {
  FACEBOOK: "Facebook",
  GOOGLE: "Google",
  MICROSOFT: "Microsoft",
  OPENID: "OpenIdConnect",
  WSFEDERATION: "WsFederation",
  TWITTER: "Twitter",
} as const;

export type ExternalLoginProviderName =
  (typeof ExternalLoginProviders)[keyof typeof ExternalLoginProviders];

export interface ExternalLoginProviderInfo {
  provider: ExternalLoginProviderInfoModel;
  icon: string;
  initialized: boolean;
}

export function getProviderIcon(providerName: string): string {
  const normalized = (providerName || "").toLowerCase();
  switch (normalized) {
    case "facebook":
      return "facebook";
    case "google":
      return "google";
    case "microsoft":
      return "microsoft";
    case "twitter":
      return "twitter";
    case "openidconnect":
      return "openid";
    case "wsfederation":
      return "windows";
    default:
      return normalized;
  }
}

export function getProviderDisplayName(providerName: string): string {
  switch (providerName) {
    case ExternalLoginProviders.OPENID:
      return "OpenID";
    case ExternalLoginProviders.WSFEDERATION:
      return "WS-Federation";
    default:
      return providerName;
  }
}
