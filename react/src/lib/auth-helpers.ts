import axios from "axios";
import AppConsts from "./app-consts";
import { store } from "@/app/store";
import {
  setToken as setAuthToken,
  logout as authLogout,
} from "@/app/slices/authSlice";
import { clearSession } from "@/app/slices/sessionSlice";
import { loadSessionData } from "@/app/bootstrap/AppBootstrap";
import L from "./L";

export function hardLogout(): void {
  try {
    abp?.auth?.setToken?.("");
    abp?.auth?.clearRefreshToken?.();
    abp?.utils?.deleteCookie?.("Abp.AuthToken", abp?.appPath);
    localStorage.removeItem(AppConsts.authorization.encrptedAuthTokenName);
    localStorage.removeItem("TwoFactorRememberClientToken");
    delete axios.defaults.headers.common["Authorization"];
    store.dispatch(clearSession());
    store.dispatch(authLogout());
    loadSessionData().catch(() => {});
  } catch {
    abp.message?.error?.(L("AnErrorOccurred"));
  }
}

export function setAuthTokens(
  accessToken: string,
  encryptedAccessToken: string,
  callback?: () => void,
): void {
  try {
    abp.auth.setToken(accessToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    store.dispatch(setAuthToken(accessToken));
    setEncryptedTokenCookie(encryptedAccessToken, callback);
  } catch {
    abp.message?.error?.(L("AnErrorOccurred"));
  }
}

export function setEncryptedTokenCookie(
  encryptedAccessToken: string,
  callback?: () => void,
): void {
  localStorage.setItem(
    AppConsts.authorization.encrptedAuthTokenName,
    JSON.stringify({ token: encryptedAccessToken }),
  );
  if (callback) {
    callback();
  }
}

export function setRefreshToken(
  refreshToken: string | undefined,
  refreshTokenExpireInSeconds: number | undefined,
  rememberClient?: boolean,
): void {
  if (!refreshToken) {
    return;
  }

  const expireDate =
    rememberClient && refreshTokenExpireInSeconds
      ? new Date(Date.now() + refreshTokenExpireInSeconds * 1000)
      : undefined;

  abp?.auth?.setRefreshToken?.(refreshToken, expireDate);
}

export function getRefreshToken(): string | undefined {
  return abp?.auth?.getRefreshToken?.() || undefined;
}

export function clearRefreshToken(): void {
  abp?.auth?.clearRefreshToken?.();
}
