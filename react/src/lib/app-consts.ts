const AppConsts = {
  get remoteServiceBaseUrl(): string {
    const env: Record<string, unknown> =
      (import.meta as { env?: Record<string, unknown> }).env || {};
    const rawViteUrl = env?.VITE_API_URL;
    const rawViteBaseUrl = env?.VITE_API_BASE_URL;
    const raw: string =
      typeof rawViteUrl === "string"
        ? rawViteUrl
        : typeof rawViteBaseUrl === "string"
          ? rawViteBaseUrl
          : "";
    return typeof raw === "string" ? raw.replace(/\/+$/, "") : "";
  },
  get appBaseUrl(): string {
    return window.location.origin;
  },
  authorization: {
    encrptedAuthTokenName: "enc_auth_token",
  },
  subscriptionExpireNootifyDayCount: 0,
  timing: {
    longDateFormat: "L LTS",
    shortDateFormat: "L",
    dateTimeFormat: "L LT",
    shortTimeFormat: "LT",
    longTimeFormat: "LTS",
  },
};
export default AppConsts;
