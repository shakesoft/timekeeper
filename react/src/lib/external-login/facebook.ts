import type { ExternalLoginProviderInfoModel } from "@/api/generated/service-proxies";
import { ExternalLoginProviders } from "@/lib/external-login-provider";
import { loadScripts } from "@/lib/script-loader";
import { callExternalAuthenticate } from "./common";
import type { ExternalLoginCallbacks } from "./types";

declare const FB: {
  init(params: {
    appId: string;
    cookie: boolean;
    xfbml: boolean;
    version: string;
  }): void;
  getLoginStatus(cb: (response: FacebookLoginStatusResponse) => void): void;
  login(
    cb: (response: FacebookLoginStatusResponse) => void,
    opts?: { scope?: string },
  ): void;
};

interface FacebookLoginStatusResponse {
  status: "connected" | "not_authorized" | "unknown";
  authResponse?: {
    accessToken: string;
    userID: string;
  };
}

let initialized = false;

async function initFacebook(
  provider: ExternalLoginProviderInfoModel,
): Promise<void> {
  if (initialized) return;

  await loadScripts("//connect.facebook.net/en_US/sdk.js");

  FB.init({
    appId: provider.clientId || "",
    cookie: false,
    xfbml: true,
    version: "v21.0",
  });

  initialized = true;
}

export async function loginWithFacebook(
  provider: ExternalLoginProviderInfoModel,
  callbacks: ExternalLoginCallbacks,
): Promise<void> {
  await initFacebook(provider);

  return new Promise<void>((resolve) => {
    FB.login(
      (response: FacebookLoginStatusResponse) => {
        if (response.status === "connected" && response.authResponse) {
          callExternalAuthenticate(
            ExternalLoginProviders.FACEBOOK,
            response.authResponse.userID,
            response.authResponse.accessToken,
            callbacks,
          )
            .then(() => resolve())
            .catch((err) => {
              callbacks.onError(err);
              resolve();
            });
        } else {
          resolve();
        }
      },
      { scope: "email" },
    );
  });
}
