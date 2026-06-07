type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

function getSiteKey(): string | undefined {
  const key = abp?.setting?.get?.("Recaptcha.SiteKey");
  if (typeof key === "string" && key) return key;
  return undefined;
}

function getCaptchaSettings() {
  const hasTenant = abp?.session?.tenantId && abp.session.tenantId > 0;
  return {
    login: "App.UserManagement.UseCaptchaOnLogin",
    register: hasTenant
      ? "App.UserManagement.UseCaptchaOnRegistration"
      : "App.TenantManagement.UseCaptchaOnRegistration",
    resetPassword: hasTenant
      ? "App.UserManagement.UseCaptchaOnResetPassword"
      : "App.TenantManagement.UseCaptchaOnResetPassword",
    emailActivation: hasTenant
      ? "App.UserManagement.UseCaptchaOnEmailActivation"
      : "App.TenantManagement.UseCaptchaOnEmailActivation",
  } as const;
}

function checkCaptchaSetting(settingKey: string): boolean {
  return abp?.setting?.getBoolean?.(settingKey) ?? false;
}

function ensureScriptLoaded(siteKey: string): Promise<void> {
  return new Promise((resolve) => {
    const w = window as { grecaptcha?: Grecaptcha };
    const existing = document.querySelector(
      'script[src^="https://www.google.com/recaptcha/api.js"]',
    ) as HTMLScriptElement | null;
    const ready = () => resolve();
    if (w.grecaptcha && typeof w.grecaptcha.ready === "function") {
      w.grecaptcha.ready(() => ready());
      return;
    }
    if (!existing) {
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        const grecaptcha: Grecaptcha | undefined = (
          window as { grecaptcha?: Grecaptcha }
        ).grecaptcha;
        if (grecaptcha && typeof grecaptcha.ready === "function")
          grecaptcha.ready(() => ready());
        else ready();
      };
      document.head.appendChild(script);
    } else {
      existing.addEventListener("load", ready);
    }
  });
}

async function execute(action: string): Promise<string | undefined> {
  const siteKey = getSiteKey();

  if (!siteKey) return undefined;
  await ensureScriptLoaded(siteKey);
  try {
    const grecaptcha: Grecaptcha | undefined = (
      window as { grecaptcha?: Grecaptcha }
    ).grecaptcha;
    if (!grecaptcha) return undefined;
    const token = await grecaptcha.execute(siteKey, { action });
    return token || undefined;
  } catch {
    return undefined;
  }
}

function applyCaptchaVisibility(element: Element, settingKey: string): void {
  if (checkCaptchaSetting(settingKey)) {
    element.classList.remove("d-none");
  } else {
    element.classList.add("d-none");
  }
}

function setCaptchaVisibility(settingKey: string): void {
  const recaptchaElements = document.getElementsByClassName("grecaptcha-badge");

  if (recaptchaElements.length <= 0) {
    const observer = new MutationObserver((_mutations, obs) => {
      const elements = document.getElementsByClassName("grecaptcha-badge");
      if (elements.length > 0) {
        applyCaptchaVisibility(elements[0], settingKey);
        obs.disconnect();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    return;
  }
  applyCaptchaVisibility(recaptchaElements[0], settingKey);
}

export const recaptcha = {
  getService: () => ({ execute }),
  useCaptchaOnLogin: () => checkCaptchaSetting(getCaptchaSettings().login),
  useCaptchaOnRegister: () =>
    checkCaptchaSetting(getCaptchaSettings().register),
  useCaptchaOnResetPassword: () =>
    checkCaptchaSetting(getCaptchaSettings().resetPassword),
  useCaptchaOnEmailActivation: () =>
    checkCaptchaSetting(getCaptchaSettings().emailActivation),
  setCaptchaVisibilityOnLogin: () =>
    setCaptchaVisibility(getCaptchaSettings().login),
  setCaptchaVisibilityOnRegister: () =>
    setCaptchaVisibility(getCaptchaSettings().register),
  setCaptchaVisibilityOnResetPassword: () =>
    setCaptchaVisibility(getCaptchaSettings().resetPassword),
  setCaptchaVisibilityOnEmailActivation: () =>
    setCaptchaVisibility(getCaptchaSettings().emailActivation),
  execute,
};

export default recaptcha;
