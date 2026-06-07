import type { ExternalLoginProviderInfoModel } from "@/api/generated/service-proxies";
import { ExternalLoginProviders } from "@/lib/external-login-provider";
import {
  base64urlEncode,
  callExternalAuthenticate,
  cleanUrlAfterCallback,
  extractSubFromJwt,
  generateNonce,
} from "./common";
import type { ExternalLoginCallbacks } from "./types";

interface OidcDiscoveryDocument {
  authorization_endpoint?: string;
  token_endpoint?: string;
  issuer?: string;
  [key: string]: unknown;
}

async function fetchDiscoveryDocument(
  authority: string,
): Promise<OidcDiscoveryDocument | null> {
  const base = authority.replace(/\/+$/, "");
  try {
    const resp = await fetch(`${base}/.well-known/openid-configuration`);
    if (resp.ok) {
      return (await resp.json()) as OidcDiscoveryDocument;
    }
    abp?.log?.warn?.(`OIDC discovery returned ${resp.status} for ${base}`);
  } catch (err) {
    abp?.log?.warn?.(`OIDC discovery fetch failed for ${base}: ${err}`);
  }
  return null;
}

async function generatePkce(): Promise<{
  verifier: string;
  challenge: string;
}> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = base64urlEncode(array);

  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const challenge = base64urlEncode(new Uint8Array(digest));

  return { verifier, challenge };
}

const OIDC_KEYS = {
  CODE_VERIFIER: "oidc_code_verifier",
  TOKEN_ENDPOINT: "oidc_token_endpoint",
  CLIENT_ID: "oidc_client_id",
  NONCE: "oidc_nonce",
} as const;

export async function loginWithOpenIdConnect(
  provider: ExternalLoginProviderInfoModel,
): Promise<void> {
  const params = provider.additionalParams || {};
  const loginUrl = params["LoginUrl"] || "";
  const authority = params["Authority"] || "";
  const clientId = provider.clientId || "";
  const responseType = params["ResponseType"] || "id_token";
  const redirectUri = `${window.location.origin}/account/login`;
  const scope = "openid profile email";

  let discovery: OidcDiscoveryDocument | null = null;
  if (authority && (!loginUrl || responseType === "code")) {
    discovery = await fetchDiscoveryDocument(authority);
  }

  const authorizationUrl =
    loginUrl || discovery?.authorization_endpoint || null;

  if (!authorizationUrl) {
    abp?.message?.error?.(
      "OpenID Connect authorization endpoint could not be determined. " +
        "Configure LoginUrl or Authority in the provider settings.",
    );
    return;
  }

  const urlParams: Record<string, string> = {
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: responseType,
    scope,
    state: "openIdConnect=1",
  };

  if (responseType === "code") {
    let tokenEndpoint = (discovery?.token_endpoint as string) || null;

    if (!tokenEndpoint && loginUrl) {
      const derived = loginUrl.replace(/\/authorize(\?.*)?$/, "/token");
      if (derived !== loginUrl) tokenEndpoint = derived;
    }

    if (!tokenEndpoint) {
      abp?.message?.error?.(
        "OpenID Connect token endpoint could not be determined. " +
          "Configure Authority or LoginUrl in the provider settings.",
      );
      return;
    }

    const pkce = await generatePkce();

    sessionStorage.setItem(OIDC_KEYS.CODE_VERIFIER, pkce.verifier);
    sessionStorage.setItem(OIDC_KEYS.TOKEN_ENDPOINT, tokenEndpoint);
    sessionStorage.setItem(OIDC_KEYS.CLIENT_ID, clientId);

    urlParams.code_challenge = pkce.challenge;
    urlParams.code_challenge_method = "S256";
  } else {
    const nonce = generateNonce();
    sessionStorage.setItem(OIDC_KEYS.NONCE, nonce);
    urlParams.nonce = nonce;
  }

  window.location.href = `${authorizationUrl}?${new URLSearchParams(urlParams).toString()}`;
}

export async function handleOpenIdConnectCallback(
  callbacks: ExternalLoginCallbacks,
): Promise<boolean> {
  const queryParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(
    window.location.hash.replace(/^#\/?/, ""),
  );

  const state = queryParams.get("state") || hashParams.get("state") || "";

  if (!state.includes("openIdConnect")) {
    return false;
  }

  const code = queryParams.get("code");
  if (code) {
    const verifier = sessionStorage.getItem(OIDC_KEYS.CODE_VERIFIER);
    const storedTokenEndpoint =
      sessionStorage.getItem(OIDC_KEYS.TOKEN_ENDPOINT) || "";
    const storedClientId = sessionStorage.getItem(OIDC_KEYS.CLIENT_ID) || "";

    Object.values(OIDC_KEYS).forEach((key) => sessionStorage.removeItem(key));

    if (!verifier) {
      callbacks.onError(
        new Error("OIDC code flow: code_verifier missing from session."),
      );
      return true;
    }

    if (!storedTokenEndpoint) {
      callbacks.onError(
        new Error("OIDC code flow: token endpoint missing from session."),
      );
      return true;
    }

    try {
      const tokenResp = await fetch(storedTokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: `${window.location.origin}/account/login`,
          client_id: storedClientId,
          code_verifier: verifier,
        }).toString(),
      });

      if (!tokenResp.ok) {
        const errText = await tokenResp.text();
        throw new Error(
          `OIDC token exchange failed (${tokenResp.status}): ${errText}`,
        );
      }

      const tokenData = (await tokenResp.json()) as Record<string, unknown>;
      const idToken = tokenData.id_token as string | undefined;
      if (!idToken) {
        throw new Error("Token endpoint did not return an id_token.");
      }

      const sub = extractSubFromJwt(idToken);
      if (!sub) {
        throw new Error("Could not extract 'sub' claim from id_token.");
      }

      cleanUrlAfterCallback();

      await callExternalAuthenticate(
        ExternalLoginProviders.OPENID,
        sub,
        idToken,
        callbacks,
      );
    } catch (err) {
      callbacks.onError(err);
    }
    return true;
  }

  const idToken = hashParams.get("id_token");
  if (idToken) {
    sessionStorage.removeItem(OIDC_KEYS.NONCE);

    const sub = extractSubFromJwt(idToken);
    if (!sub) {
      callbacks.onError(
        new Error(
          "Could not extract 'sub' claim from OpenID Connect id_token.",
        ),
      );
      return true;
    }

    cleanUrlAfterCallback();

    await callExternalAuthenticate(
      ExternalLoginProviders.OPENID,
      sub,
      idToken,
      callbacks,
    );
    return true;
  }

  return false;
}
