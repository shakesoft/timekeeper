import { TwitterServiceProxy } from "@/api/generated/service-proxies";
import { createServiceProxy } from "@/api/service-proxy-factory";
import { ExternalLoginProviders } from "@/lib/external-login-provider";
import { callExternalAuthenticate, getQueryParam } from "./common";
import type { ExternalLoginCallbacks } from "./types";

export async function loginWithTwitter(): Promise<void> {
  const twitterSvc = createServiceProxy(TwitterServiceProxy);
  const result = await twitterSvc.getRequestToken();

  if (result.confirmed && result.redirectUrl) {
    window.location.href = result.redirectUrl;
  } else {
    abp?.message?.error?.("Could not get Twitter request token!");
  }
}

export async function handleTwitterCallback(
  callbacks: ExternalLoginCallbacks,
): Promise<boolean> {
  const oauthToken = getQueryParam("oauth_token");
  const verifier = getQueryParam("oauth_verifier");

  if (!oauthToken || !verifier) {
    return false;
  }

  try {
    const twitterSvc = createServiceProxy(TwitterServiceProxy);
    const twitterResult = await twitterSvc.getAccessToken(oauthToken, verifier);

    await callExternalAuthenticate(
      ExternalLoginProviders.TWITTER,
      twitterResult.userId || "",
      `${twitterResult.accessToken}&${twitterResult.accessTokenSecret}`,
      callbacks,
    );
    return true;
  } catch (err) {
    callbacks.onError(err);
    return true;
  }
}
