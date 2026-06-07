import {
  ExternalAuthenticateModel,
  TokenAuthServiceProxy,
} from "@/api/generated/service-proxies";
import { createServiceProxy } from "@/api/service-proxy-factory";
import type { ExternalLoginCallbacks } from "./types";

export function clearMsalInteractionState(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith("msal.") && key.includes("interaction")) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => sessionStorage.removeItem(key));
}

export function getQueryParam(name: string): string | null {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

export function getSingleSignIn(): boolean {
  return getQueryParam("singleSignIn") === "true";
}

export function getReturnUrl(): string | undefined {
  return getQueryParam("returnUrl") || undefined;
}

export async function callExternalAuthenticate(
  authProvider: string,
  providerKey: string,
  providerAccessCode: string,
  callbacks: ExternalLoginCallbacks,
): Promise<void> {
  const model = new ExternalAuthenticateModel();
  model.authProvider = authProvider;
  model.providerKey = providerKey;
  model.providerAccessCode = providerAccessCode;
  model.singleSignIn = getSingleSignIn();
  model.returnUrl = getReturnUrl();

  const tokenAuth = createServiceProxy(TokenAuthServiceProxy);
  const result = await tokenAuth.externalAuthenticate(model);

  if (result.waitingForActivation) {
    callbacks.onWaitingForActivation();
    return;
  }

  callbacks.onExternalAuthSuccess(result);
}

export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function base64urlEncode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...Array.from(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function extractSubFromJwt(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4 !== 0) b64 += "=";

    const payload = JSON.parse(atob(b64)) as Record<string, unknown>;
    return (
      (payload.sub as string) ||
      (payload.oid as string) ||
      (payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] as string) ||
      null
    );
  } catch {
    return null;
  }
}

export function cleanUrlAfterCallback(): void {
  try {
    const url = new URL(window.location.href);
    url.searchParams.delete("oauth_token");
    url.searchParams.delete("oauth_verifier");
    url.searchParams.delete("state");
    url.searchParams.delete("code");
    url.hash = "";
    window.history.replaceState({}, document.title, url.toString());
  } catch (err) {
    abp?.log?.warn?.(`Failed to clean URL after callback: ${err}`);
  }
}
