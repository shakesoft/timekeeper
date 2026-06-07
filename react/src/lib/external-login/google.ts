import type { ExternalLoginProviderInfoModel } from "@/api/generated/service-proxies";
import { ExternalLoginProviders } from "@/lib/external-login-provider";
import { loadScripts } from "@/lib/script-loader";
import { callExternalAuthenticate } from "./common";
import type { ExternalLoginCallbacks } from "./types";

declare const gapi: {
  load(api: string, callback: () => void): void;
  client: {
    init(params: Record<string, unknown>): Promise<void>;
    load(api: string, version: string, callback: () => void): void;
    getToken(): { access_token: string } | null;
    oauth2: {
      userinfo: {
        get(): { execute(cb: (resp: { id: string }) => void): void };
      };
    };
  };
};

declare const google: {
  accounts: {
    oauth2: {
      initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: (response: GoogleTokenResponse) => void;
      }): { requestAccessToken(opts: { prompt: string }): void };
    };
  };
};

interface GoogleTokenResponse {
  access_token: string;
  error?: string;
}

let initialized = false;

async function initGoogle(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _provider: ExternalLoginProviderInfoModel,
): Promise<void> {
  if (initialized) return;

  await loadScripts(
    "https://apis.google.com/js/api.js",
    "https://accounts.google.com/gsi/client",
  );

  await new Promise<void>((resolve) => {
    gapi.load("client", () => {
      gapi.client.init({}).then(() => {
        gapi.client.load("oauth2", "v2", () => {
          initialized = true;
          resolve();
        });
      });
    });
  });
}

export async function loginWithGoogle(
  provider: ExternalLoginProviderInfoModel,
  callbacks: ExternalLoginCallbacks,
): Promise<void> {
  await initGoogle(provider);

  return new Promise<void>((resolve) => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: provider.clientId || "",
      scope: "openid profile email",
      callback: (response: GoogleTokenResponse) => {
        if (response.error) {
          callbacks.onError(new Error(response.error));
          resolve();
          return;
        }

        gapi.client.oauth2.userinfo
          .get()
          .execute((userInfo: { id: string }) => {
            callExternalAuthenticate(
              ExternalLoginProviders.GOOGLE,
              userInfo.id,
              response.access_token,
              callbacks,
            )
              .then(() => resolve())
              .catch((err) => {
                callbacks.onError(err);
                resolve();
              });
          });
      },
    });

    const prompt = gapi.client.getToken() === null ? "consent" : "";
    tokenClient.requestAccessToken({ prompt });
  });
}
