import * as signalR from "@microsoft/signalr";
import AppConsts from "./app-consts";

type InitOptions = {
  onReady?: () => void;
};

function readEncryptedAuthToken(): string | undefined {
  try {
    const raw = localStorage.getItem(
      AppConsts.authorization.encrptedAuthTokenName,
    );
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { token?: string } | undefined;
    return parsed?.token || undefined;
  } catch {
    return undefined;
  }
}

export function initAbpSignalR(options: InitOptions = {}): void {
  const onReady = options?.onReady;

  const encryptedAuthToken = readEncryptedAuthToken();

  if (typeof window !== "undefined") {
    window.signalR = signalR;
  }

  abp.signalr = {
    autoConnect: false,
    qs: encryptedAuthToken
      ? `${AppConsts.authorization.encrptedAuthTokenName}=${encodeURIComponent(encryptedAuthToken)}`
      : "",
    remoteServiceBaseUrl: AppConsts.remoteServiceBaseUrl,
    url: "/signalr",
    withUrlOptions: {},
    connect: abp?.signalr?.connect,
    startConnection: abp?.signalr?.startConnection,
    hubs: abp?.signalr?.hubs,
  };

  const script = document.createElement("script");
  script.onload = () => {
    onReady?.();
  };
  script.onerror = () => {
    onReady?.();
  };
  script.src = AppConsts.appBaseUrl + "/assets/abp/abp.signalr-client.js";
  document.head.appendChild(script);
}

export function updateSignalRQueryString(
  encryptedAuthToken: string | undefined,
) {
  if (!abp?.signalr) {
    return;
  }

  abp.signalr.qs = encryptedAuthToken
    ? `${AppConsts.authorization.encrptedAuthTokenName}=${encodeURIComponent(encryptedAuthToken)}`
    : "";
}

export default {
  initAbpSignalR,
  updateSignalRQueryString,
};
