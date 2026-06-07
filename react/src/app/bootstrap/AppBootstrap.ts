import { store } from "../store";
import { setUser, setLoading, setToken } from "../slices/authSlice";
import { setSession } from "../slices/sessionSlice";
import {
  setThemeSettings,
  setActiveTheme,
  setContainerClass,
} from "../slices/uiSlice";
import { SessionServiceProxy } from "@api/generated/service-proxies";
import { fetchAbpUserConfiguration } from "@/api/abp-user-configuration";
import AppConsts from "@/lib/app-consts";
import { createServiceProxy } from "@/api/service-proxy-factory";
import { updateMetronicThemeBundles } from "@/lib/theme-bundles";
import { themeModelSKey } from "../../../metronic/app/partials/layout/theme-mode/ThemeModeProvider";

export async function initializeAuth(): Promise<void> {
  const abpToken = abp?.auth?.getToken?.() || "";

  if (abpToken) {
    store.dispatch(setToken(abpToken));
  }

  await loadSessionData();
}

export async function loadSessionData(): Promise<void> {
  try {
    const sessionService = createServiceProxy(SessionServiceProxy);
    store.dispatch(setLoading(true));
    const [info, userConfig] = await Promise.all([
      sessionService.getCurrentLoginInformations(),
      fetchAbpUserConfiguration(AppConsts.remoteServiceBaseUrl),
    ]);

    if (userConfig && window.__applyAbpUserConfiguration) {
      window.__applyAbpUserConfiguration(userConfig);
    }

    const subscriptionExpireNotifyDayCount = abp?.setting?.get?.(
      "App.TenantManagement.SubscriptionExpireNotifyDayCount",
    );
    if (subscriptionExpireNotifyDayCount) {
      AppConsts.subscriptionExpireNootifyDayCount = parseInt(
        subscriptionExpireNotifyDayCount,
      );
    }

    const user = info?.user;
    if (user) {
      store.dispatch(
        setUser({
          id: String(user.id),
          email: user.emailAddress || "",
          name: user.userName || user.name || "",
          first_name: user.name || "",
          last_name: user.surname || "",
          role: "",
        }),
      );
    }

    const sessionPayload = {
      user: user ? (user.toJSON?.() ?? user) : null,
      tenant: info?.tenant ? (info.tenant.toJSON?.() ?? info.tenant) : null,
      application: info?.application
        ? (info.application.toJSON?.() ?? info.application)
        : null,
      auth: userConfig?.auth,
      features: userConfig?.features,
      theme: info?.theme ? (info.theme.toJSON?.() ?? info.theme) : null,
    };

    store.dispatch(setSession(sessionPayload));

    const baseSettings =
      info?.theme?.baseSettings?.toJSON?.() ?? info?.theme?.baseSettings;
    if (baseSettings) {
      store.dispatch(setThemeSettings({ baseSettings }));
      const themeName = baseSettings?.theme;
      if (typeof themeName === "string" && themeName) {
        store.dispatch(setActiveTheme(themeName));
        updateMetronicThemeBundles(themeName);
      }

      const layoutType = baseSettings?.layout?.layoutType;
      if (layoutType === "fixed") {
        store.dispatch(setContainerClass("container-xxl"));
      } else if (layoutType === "fluid") {
        store.dispatch(setContainerClass("container-fluid"));
      }

      const isDark = !!baseSettings?.layout?.darkMode;
      localStorage.setItem(themeModelSKey, isDark ? "dark" : "light");

      const el = document?.documentElement;
      if (el) {
        el.setAttribute("data-bs-theme", isDark ? "dark" : "light");
      }
    }
  } finally {
    store.dispatch(setLoading(false));
  }
}
