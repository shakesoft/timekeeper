import {
  PublicClientApplication,
  type AuthenticationResult,
  type Configuration,
} from "@azure/msal-browser";
import type { ExternalLoginProviderInfoModel } from "@/api/generated/service-proxies";
import { ExternalLoginProviders } from "@/lib/external-login-provider";
import AppConsts from "@/lib/app-consts";
import { callExternalAuthenticate, clearMsalInteractionState } from "./common";
import type { ExternalLoginCallbacks } from "./types";

let msalInstance: PublicClientApplication | null = null;

function normalizeAuthority(authority: string): string {
  return authority.replace(/\/v2\.0\/?$/, "");
}

function getWsFederationConfig(
  provider: ExternalLoginProviderInfoModel,
): Configuration {
  const params = provider.additionalParams || {};
  const tenant = params["Tenant"] || "";
  const authorityParam = params["Authority"] || "";

  const rawAuthority = authorityParam
    ? authorityParam
    : tenant
      ? `https://login.microsoftonline.com/${tenant}`
      : "https://login.microsoftonline.com/common";

  return {
    auth: {
      clientId: provider.clientId || "",
      authority: normalizeAuthority(rawAuthority),
      redirectUri: AppConsts.appBaseUrl,
    },
    cache: {
      cacheLocation: "localStorage",
    },
  };
}

export async function loginWithWsFederation(
  provider: ExternalLoginProviderInfoModel,
  callbacks: ExternalLoginCallbacks,
): Promise<void> {
  try {
    msalInstance = new PublicClientApplication(getWsFederationConfig(provider));

    await msalInstance.initialize();

    clearMsalInteractionState();
    const response: AuthenticationResult = await msalInstance.loginPopup({
      scopes: ["openid", "profile", "email"],
    });

    const idTokenClaims = response.idTokenClaims as
      | Record<string, unknown>
      | undefined;
    const sub = (idTokenClaims?.sub as string) || response.uniqueId;

    if (!sub) {
      throw new Error(
        "Could not extract 'sub' claim from WsFederation response.",
      );
    }

    await callExternalAuthenticate(
      ExternalLoginProviders.WSFEDERATION,
      sub,
      response.idToken,
      callbacks,
    );
  } catch (err) {
    callbacks.onError(err);
  }
}
