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

function getMsalConfig(
  provider: ExternalLoginProviderInfoModel,
): Configuration {
  return {
    auth: {
      clientId: provider.clientId || "",
      authority: "https://login.microsoftonline.com/common",
      redirectUri: AppConsts.appBaseUrl,
    },
    cache: {
      cacheLocation: "localStorage",
    },
  };
}

export async function loginWithMicrosoft(
  provider: ExternalLoginProviderInfoModel,
  callbacks: ExternalLoginCallbacks,
): Promise<void> {
  msalInstance = new PublicClientApplication(getMsalConfig(provider));

  try {
    await msalInstance.initialize();

    const scopes = ["user.read"];

    clearMsalInteractionState();
    await msalInstance.loginPopup({ scopes });

    const accounts = msalInstance.getAllAccounts();
    if (!accounts.length) {
      throw new Error("No MSAL accounts found after login popup.");
    }

    const tokenResponse: AuthenticationResult =
      await msalInstance.acquireTokenSilent({
        account: accounts[0],
        scopes,
      });

    await callExternalAuthenticate(
      ExternalLoginProviders.MICROSOFT,
      tokenResponse.uniqueId,
      tokenResponse.accessToken,
      callbacks,
    );
  } catch (err) {
    clearMsalInteractionState();
    msalInstance = null;

    const msalErr = err as { errorCode?: string };
    if (
      msalErr?.errorCode === "user_cancelled" ||
      msalErr?.errorCode === "popup_window_error"
    ) {
      return;
    }
    callbacks.onError(err as Error);
  }
}
