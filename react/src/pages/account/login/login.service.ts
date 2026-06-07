import { useCallback, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import {
  AuthenticateModel,
  AuthenticateResultModel,
  ExternalAuthenticateResultModel,
  ExternalLoginProviderInfoModel,
  TokenAuthServiceProxy,
} from "../../../api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import { updateSignalRQueryString } from "../../../lib/signalr-helper";
import recaptcha from "@/lib/recaptcha-v3";
import AppConsts from "@/lib/app-consts";
import {
  startExternalLogin as startExternalLoginFlow,
  handleExternalLoginCallbacks as handleExternalCallbacks,
  type ExternalLoginCallbacks,
} from "@/lib/external-login";
import { isQrLoginEnabled } from "@/lib/qr-login-helper";
import { setRefreshToken } from "@/lib/auth-helpers";

type Nullable<T> = T | null | undefined;

const TWO_FACTOR_REMEMBER_CLIENT_TOKEN = "TwoFactorRememberClientToken";

function getQueryParam(name: string): string | null {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

function getSingleSignIn(): boolean {
  return getQueryParam("singleSignIn") === "true";
}

function getReturnUrl(): string | undefined {
  const value = getQueryParam("returnUrl") || "";
  return value || undefined;
}

function getTwoFactorRememberClientTokenKey(): string {
  const tenantId = abp?.session?.tenantId;
  if (tenantId) {
    return `${TWO_FACTOR_REMEMBER_CLIENT_TOKEN}_${tenantId}`;
  }
  return `${TWO_FACTOR_REMEMBER_CLIENT_TOKEN}_Host`;
}

function getTwoFactorRememberClientToken(): string | null {
  try {
    const tokenKey = getTwoFactorRememberClientTokenKey();
    const twoFactorRememberClientToken = localStorage.getItem(tokenKey);
    if (twoFactorRememberClientToken) {
      const parsed = JSON.parse(twoFactorRememberClientToken);
      if (parsed?.expireDate) {
        const expireDate = new Date(parsed.expireDate);
        if (expireDate > new Date()) {
          return parsed.token;
        } else {
          localStorage.removeItem(tokenKey);
        }
      } else {
        return parsed?.token || null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export type UseLoginServiceReturn = {
  authenticate: (model: AuthenticateModel) => Promise<void>;

  twoFactorAuthProviders: string[];
  twoFactorUserId: number | null;
  canProceedTwoFactor: boolean;
  finalizeTwoFactor: (
    code: string,
    rememberClient: boolean,
    captchaResponse?: Nullable<string>,
  ) => Promise<void>;

  initExternalLoginProviders: () => Promise<void>;
  externalLoginProviders: ExternalLoginProviderInfoModel[];
  startExternalLogin: (
    provider: ExternalLoginProviderInfoModel,
  ) => Promise<void>;
  handleExternalCallbackIfAny: () => void;

  isPasswordlessLoginEnabled: boolean;
  isQrLoginEnabled: boolean;
  qrLoginAuthenticate: (
    result: Pick<
      AuthenticateResultModel,
      | "accessToken"
      | "encryptedAccessToken"
      | "expireInSeconds"
      | "refreshToken"
      | "refreshTokenExpireInSeconds"
    >,
  ) => void;
  isSelfRegistrationAllowed: boolean;
  isTenantSelfRegistrationAllowed: boolean;
  isMultiTenancyEnabled: boolean;
  multiTenancySideIsTenant: boolean;
};

export function useLoginService(): UseLoginServiceReturn {
  const dispatch = useDispatch();
  const tokenAuth = useServiceProxy(TokenAuthServiceProxy, []);

  const [externalLoginProviders, setExternalLoginProviders] = useState<
    ExternalLoginProviderInfoModel[]
  >([]);

  const lastAuthModelRef = useRef<AuthenticateModel | null>(null);
  const [twoFactorAuthProviders, setTwoFactorAuthProviders] = useState<
    string[]
  >(() => {
    try {
      const twoFactorProviders = sessionStorage.getItem("twoFactor.providers");
      return twoFactorProviders
        ? (JSON.parse(twoFactorProviders) as string[])
        : [];
    } catch {
      return [];
    }
  });
  const [twoFactorUserId, setTwoFactorUserId] = useState<number | null>(() => {
    try {
      const twoFactorUserId = sessionStorage.getItem("twoFactor.userId");
      return twoFactorUserId ? (JSON.parse(twoFactorUserId) as number) : null;
    } catch {
      return null;
    }
  });

  const isPasswordlessLoginEnabled = useMemo(() => {
    try {
      const email = !!abp?.setting?.getBoolean?.(
        "App.UserManagement.PasswordlessLogin.IsEmailPasswordlessLoginEnabled",
      );
      const sms = !!abp?.setting?.getBoolean?.(
        "App.UserManagement.PasswordlessLogin.IsSmsPasswordlessLoginEnabled",
      );
      return email || sms;
    } catch {
      return false;
    }
  }, []);

  const isSelfRegistrationAllowed = useMemo(() => {
    try {
      return (
        !!abp?.setting?.getBoolean?.(
          "App.UserManagement.IsSelfRegistrationEnabled",
        ) ||
        !!abp?.setting?.getBoolean?.(
          "Abp.Zero.UserManagement.IsSelfRegistrationEnabled",
        ) ||
        !!abp?.setting?.getBoolean?.("App.UserManagement.AllowSelfRegistration")
      );
    } catch {
      return false;
    }
  }, []);

  const isTenantSelfRegistrationAllowed = useMemo(() => {
    try {
      return !!abp?.setting?.getBoolean?.(
        "App.TenantManagement.IsTenantSelfRegistrationEnabled",
      );
    } catch {
      return false;
    }
  }, []);

  const isMultiTenancyEnabled = useMemo(() => {
    try {
      return !!abp?.multiTenancy?.isEnabled;
    } catch {
      return false;
    }
  }, []);

  const multiTenancySideIsTenant = useMemo(() => {
    try {
      return !!abp?.session?.tenantId;
    } catch {
      return false;
    }
  }, []);

  const isQrLoginEnabledMemo = useMemo(() => isQrLoginEnabled(), []);

  const redirectToLoginResult = useCallback((redirectUrl?: string) => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
      return;
    }
    window.location.href = "/app";
  }, []);

  const completeTokenLogin = useCallback(
    (
      result: AuthenticateResultModel | ExternalAuthenticateResultModel,
      rememberClient?: boolean,
    ) => {
      const token = result?.accessToken as string | undefined;
      const expireSeconds = result?.expireInSeconds as number | undefined;
      const encryptedAccessToken = result?.encryptedAccessToken as
        | string
        | undefined;
      if (token) {
        const expireDate =
          rememberClient && expireSeconds
            ? new Date(Date.now() + expireSeconds * 1000)
            : undefined;
        abp?.auth?.setToken?.(token, expireDate);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        import("../../../app/slices/authSlice")
          .then((m) => {
            dispatch(m.setToken(token));
          })
          .catch(() => {});
      }
      if (encryptedAccessToken) {
        localStorage.setItem(
          AppConsts.authorization.encrptedAuthTokenName,
          JSON.stringify({ token: encryptedAccessToken }),
        );
        updateSignalRQueryString(encryptedAccessToken);
      }
      const refreshToken = result?.refreshToken as string | undefined;
      const refreshTokenExpireInSeconds =
        result?.refreshTokenExpireInSeconds as number | undefined;
      if (refreshToken && rememberClient) {
        setRefreshToken(refreshToken, refreshTokenExpireInSeconds, true);
      }

      const twoFactorRememberClientToken = (result as AuthenticateResultModel)
        ?.twoFactorRememberClientToken as string | undefined;
      if (twoFactorRememberClientToken) {
        const tokenKey = getTwoFactorRememberClientTokenKey();
        localStorage.setItem(
          tokenKey,
          JSON.stringify({
            token: twoFactorRememberClientToken,
            expireDate: new Date(Date.now() + 365 * 86400000).toISOString(),
          }),
        );
      }
      const redirectUrl = result?.returnUrl as string | undefined;
      redirectToLoginResult(redirectUrl);
    },
    [dispatch, redirectToLoginResult],
  );

  const processAuthenticateResult = useCallback(
    (result: AuthenticateResultModel, rememberClient: boolean) => {
      if (result.shouldResetPassword) {
        const c = result.c || "";
        window.location.href = `/account/reset-password?c=${encodeURIComponent(
          c,
        )}`;
        return;
      }

      if (result.requiresTwoFactorVerification) {
        const providers = result.twoFactorAuthProviders || [];
        const userId = result.userId || null;
        setTwoFactorAuthProviders(providers);
        setTwoFactorUserId(userId);
        sessionStorage.setItem(
          "twoFactor.providers",
          JSON.stringify(providers),
        );
        sessionStorage.setItem("twoFactor.userId", JSON.stringify(userId));
        const minimal = {
          userNameOrEmailAddress:
            lastAuthModelRef.current?.userNameOrEmailAddress || "",
          password: lastAuthModelRef.current?.password || "",
          captchaResponse:
            lastAuthModelRef.current?.captchaResponse || undefined,
        };
        sessionStorage.setItem("twoFactor.lastModel", JSON.stringify(minimal));
        window.location.href = "/account/send-code";
        return;
      }
      if (result.accessToken) {
        completeTokenLogin(result, !!rememberClient);
        return;
      }
      abp?.log?.warn?.("Unexpected authenticateResult!");
      window.location.href = "/account/login";
    },
    [completeTokenLogin],
  );

  const authenticate = useCallback(
    async (model: AuthenticateModel) => {
      const copy = new AuthenticateModel();
      copy.userNameOrEmailAddress = model.userNameOrEmailAddress;
      copy.password = model.password;
      copy.rememberClient = !!model.rememberClient;
      copy.twoFactorRememberClientToken =
        getTwoFactorRememberClientToken() || undefined;
      copy.singleSignIn = getSingleSignIn();
      copy.returnUrl = getReturnUrl();
      try {
        if (recaptcha.useCaptchaOnLogin()) {
          copy.captchaResponse =
            (await recaptcha.execute("login")) || undefined;
        } else {
          copy.captchaResponse = model?.captchaResponse;
        }
      } catch {
        copy.captchaResponse = model?.captchaResponse;
      }

      lastAuthModelRef.current = copy;

      const result = await tokenAuth.authenticate(copy);
      processAuthenticateResult(result, !!copy.rememberClient);
    },
    [processAuthenticateResult, tokenAuth],
  );

  const finalizeTwoFactor = useCallback(
    async (
      code: string,
      rememberClient: boolean,
      captchaResponse?: Nullable<string>,
    ) => {
      let baseUser = lastAuthModelRef.current;
      if (!baseUser) {
        const raw = sessionStorage.getItem("twoFactor.lastModel");
        if (raw) {
          const parsed = JSON.parse(raw) as {
            userNameOrEmailAddress: string;
            password: string;
            captchaResponse?: string;
          };
          baseUser = new AuthenticateModel();
          baseUser.userNameOrEmailAddress = parsed.userNameOrEmailAddress;
          baseUser.password = parsed.password;
          baseUser.captchaResponse = parsed.captchaResponse;
        }
      }
      if (!baseUser) return;
      const copy = new AuthenticateModel();
      copy.userNameOrEmailAddress = baseUser.userNameOrEmailAddress;
      copy.password = baseUser.password;
      copy.rememberClient = !!rememberClient;
      copy.twoFactorVerificationCode = code;
      copy.twoFactorRememberClientToken =
        getTwoFactorRememberClientToken() || undefined;
      copy.singleSignIn = getSingleSignIn();
      copy.returnUrl = getReturnUrl();
      copy.captchaResponse = captchaResponse || baseUser?.captchaResponse;

      const authenticateResult = await tokenAuth.authenticate(copy);
      processAuthenticateResult(authenticateResult, !!copy.rememberClient);
      sessionStorage.removeItem("twoFactor.providers");
      sessionStorage.removeItem("twoFactor.userId");
      sessionStorage.removeItem("twoFactor.lastModel");
    },
    [processAuthenticateResult, tokenAuth],
  );

  const initExternalLoginProviders = useCallback(async () => {
    try {
      const list = await tokenAuth.getExternalAuthenticationProviders();
      setExternalLoginProviders(list || []);
    } catch {
      setExternalLoginProviders([]);
    }
  }, [tokenAuth]);

  const externalLoginCallbacks = useMemo<ExternalLoginCallbacks>(
    () => ({
      onExternalAuthSuccess: (result) => {
        completeTokenLogin(result);
      },
      onWaitingForActivation: () => {
        abp?.message?.info?.(
          abp?.localization?.localize?.(
            "SuccessfullyRegisteredWaitingForActivation",
            "CadentManagement",
          ),
        );
      },
      onError: (error) => {
        abp?.log?.error?.(error);
        abp?.message?.error?.(
          abp?.localization?.localize?.(
            "CouldNotValidateExternalUser",
            "CadentManagement",
          ),
        );
      },
    }),
    [completeTokenLogin],
  );

  const startExternalLogin = useCallback(
    async (provider: ExternalLoginProviderInfoModel) => {
      try {
        await startExternalLoginFlow(provider, externalLoginCallbacks);
      } catch (err) {
        abp?.log?.error?.(err);
        abp?.message?.error?.(
          abp?.localization?.localize?.(
            "CouldNotValidateExternalUser",
            "CadentManagement",
          ),
        );
      }
    },
    [externalLoginCallbacks],
  );

  const handleExternalCallbackIfAny = useCallback(() => {
    handleExternalCallbacks(externalLoginCallbacks).catch((err) => {
      abp?.log?.error?.(err);
    });
  }, [externalLoginCallbacks]);

  const qrLoginAuthenticate = useCallback(
    (
      result: Pick<
        AuthenticateResultModel,
        | "accessToken"
        | "encryptedAccessToken"
        | "expireInSeconds"
        | "refreshToken"
        | "refreshTokenExpireInSeconds"
      >,
    ) => {
      completeTokenLogin(result as AuthenticateResultModel, false);
    },
    [completeTokenLogin],
  );

  return {
    authenticate,

    twoFactorAuthProviders,
    twoFactorUserId,
    canProceedTwoFactor:
      twoFactorUserId != null && (twoFactorAuthProviders || []).length > 0,
    finalizeTwoFactor,

    initExternalLoginProviders,
    externalLoginProviders,
    startExternalLogin,
    handleExternalCallbackIfAny,

    isPasswordlessLoginEnabled,
    isQrLoginEnabled: isQrLoginEnabledMemo,
    qrLoginAuthenticate,
    isSelfRegistrationAllowed,
    isTenantSelfRegistrationAllowed,
    isMultiTenancyEnabled,
    multiTenancySideIsTenant,
  };
}

export default useLoginService;
