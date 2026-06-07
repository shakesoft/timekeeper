import type { ExternalLoginProviderInfoModel } from "@/api/generated/service-proxies";
import { ExternalLoginProviders } from "@/lib/external-login-provider";

import { loginWithFacebook } from "./facebook";
import { loginWithGoogle } from "./google";
import { loginWithMicrosoft } from "./microsoft";
import {
  loginWithOpenIdConnect,
  handleOpenIdConnectCallback,
} from "./openid-connect";
import { loginWithWsFederation } from "./ws-federation";
import { loginWithTwitter, handleTwitterCallback } from "./twitter";

import type { ExternalLoginCallbacks } from "./types";

export type { ExternalLoginCallbacks } from "./types";

export async function startExternalLogin(
  provider: ExternalLoginProviderInfoModel,
  callbacks: ExternalLoginCallbacks,
): Promise<void> {
  const providerName = provider.name || "";

  switch (providerName) {
    case ExternalLoginProviders.FACEBOOK:
      await loginWithFacebook(provider, callbacks);
      break;

    case ExternalLoginProviders.GOOGLE:
      await loginWithGoogle(provider, callbacks);
      break;

    case ExternalLoginProviders.MICROSOFT:
      await loginWithMicrosoft(provider, callbacks);
      break;

    case ExternalLoginProviders.OPENID:
      await loginWithOpenIdConnect(provider);
      break;

    case ExternalLoginProviders.WSFEDERATION:
      await loginWithWsFederation(provider, callbacks);
      break;

    case ExternalLoginProviders.TWITTER:
      await loginWithTwitter();
      break;

    default:
      abp?.message?.warn?.(
        `External login provider '${providerName}' is not supported.`,
      );
      break;
  }
}

export async function handleExternalLoginCallbacks(
  callbacks: ExternalLoginCallbacks,
): Promise<boolean> {
  const twitterHandled = await handleTwitterCallback(callbacks);
  if (twitterHandled) return true;

  const oidcHandled = await handleOpenIdConnectCallback(callbacks);
  if (oidcHandled) return true;

  return false;
}
