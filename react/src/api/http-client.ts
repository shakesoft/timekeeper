import AppConsts from "@/lib/app-consts";
import axios, { AxiosInstance } from "axios";
import { handleAbpError } from "./error-handler";
import { hardLogout } from "@/lib/auth-helpers";

let _instance: AxiosInstance | null = null;
let _redirectingToLogin = false;

export function apiHttp(): AxiosInstance {
  if (!_instance) {
    _instance = axios.create({
      baseURL: AppConsts.remoteServiceBaseUrl,
    });
    _instance.defaults.withCredentials = true;

    _instance.interceptors.response.use(
      (r) => {
        const d = r?.data as Record<string, unknown>;
        if (
          d &&
          typeof d === "object" &&
          d.__abp &&
          "result" in d &&
          (d.success === undefined || d.success === true)
        ) {
          r.data = d.result;
        }
        return r;
      },
      (error) => {
        const status = error?.response?.status;
        if (status === 401) {
          if (
            !_redirectingToLogin &&
            !window.location.pathname.startsWith("/account")
          ) {
            _redirectingToLogin = true;
            hardLogout();
            window.location.href = "/account/login";
          }
          return Promise.reject(error);
        }

        handleAbpError(error);
        return Promise.reject(error);
      },
    );

    _instance.interceptors.request.use((cfg) => {
      try {
        cfg.headers = cfg.headers || ({} as Record<string, unknown>);
        const token = abp?.auth?.getToken?.();
        if (token && !cfg.headers["Authorization"]) {
          cfg.headers["Authorization"] = `Bearer ${token}`;
        }
        try {
          const m = document.cookie.match(
            /(?:^|; )Abp\.Localization\.CultureName=([^;]*)/,
          );
          const cookieLang = m ? decodeURIComponent(m[1]) : "";
          if (cookieLang && !cfg.headers[".AspNetCore.Culture"]) {
            cfg.headers[".AspNetCore.Culture"] =
              `c=${cookieLang}|uic=${cookieLang}`;
          }
        } catch {
          /* ignore */
        }
        try {
          const tenantCookieName =
            abp?.multiTenancy?.tenantIdCookieName || "Abp-TenantId";
          const getTenantId = () => {
            try {
              return abp?.multiTenancy?.getTenantIdCookie?.();
            } catch {
              return undefined;
            }
          };
          let tenantId: string | number | undefined = getTenantId();
          if (!tenantId) {
            const re = new RegExp(
              "(?:^|; )" +
                tenantCookieName.replace(/([.$?*|{}()[\\/+^])/g, "\\$1") +
                "=([^;]*)",
            );
            const m2 = document.cookie.match(re);
            tenantId = m2 ? decodeURIComponent(m2[1]) : "";
          }
          if (
            tenantId &&
            !(tenantCookieName in (cfg.headers as Record<string, unknown>))
          ) {
            (cfg.headers as Record<string, unknown>)[tenantCookieName] =
              tenantId + "";
          }
        } catch {
          abp.message?.error?.("An error occurred, please try again later.");
        }
        if (!cfg.headers["Accept"]) cfg.headers["Accept"] = "application/json";
      } catch {
        abp.message?.error?.("An error occurred, please try again later.");
      }
      return cfg;
    });
  }
  return _instance;
}

export default apiHttp;
