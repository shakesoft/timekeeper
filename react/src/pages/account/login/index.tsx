import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  AuthenticateModel,
  SessionServiceProxy,
  UpdateUserSignInTokenOutput,
  ExternalLoginProviderInfoModel,
} from "@api/generated/service-proxies";
import { useLoginService } from "./login.service";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import recaptcha from "@/lib/recaptcha-v3";
import {
  getProviderIcon,
  getProviderDisplayName,
} from "@/lib/external-login-provider";

type LoginFormValues = {
  userNameOrEmailAddress: string;
  password: string;
  rememberMe: boolean;
};

const LoginPage: React.FC = () => {
  const sessionService = useServiceProxy(SessionServiceProxy, []);

  const {
    initExternalLoginProviders,
    externalLoginProviders,
    authenticate,
    handleExternalCallbackIfAny,
    startExternalLogin,
    isPasswordlessLoginEnabled,
    isSelfRegistrationAllowed,
    isTenantSelfRegistrationAllowed,
    isMultiTenancyEnabled,
    multiTenancySideIsTenant,
  } = useLoginService();

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginFormValues>({
    mode: "onChange",
    defaultValues: {
      userNameOrEmailAddress: "",
      password: "",
      rememberMe: false,
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [extProvidersLoaded, setExtProvidersLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const userId = abp?.session?.userId || 0;
    const returnUrl =
      new URLSearchParams(window.location.search).get("returnUrl") || "";
    const singleSignIn =
      new URLSearchParams(window.location.search).get("singleSignIn") ===
      "true";
    if (userId > 0 && returnUrl && singleSignIn) {
      sessionService
        .updateUserSignInToken()
        .then((result: UpdateUserSignInTokenOutput) => {
          const sep = returnUrl.includes("?") ? "&" : "?";
          const full = `${returnUrl}${sep}accessToken=${encodeURIComponent(result.signInToken || "")}&userId=${encodeURIComponent(result.encodedUserId || "")}&tenantId=${encodeURIComponent(result.encodedTenantId || "")}`;
          window.location.href = full;
        })
        .catch(() => {});
    }
  }, [sessionService]);

  useEffect(() => {
    initExternalLoginProviders()
      .then(() => setExtProvidersLoaded(true))
      .catch(() => setExtProvidersLoaded(true));
    handleExternalCallbackIfAny();
  }, [handleExternalCallbackIfAny, initExternalLoginProviders]);

  useEffect(() => {
    recaptcha.setCaptchaVisibilityOnLogin();
  }, []);

  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
      setSubmitting(true);
      try {
        const model = new AuthenticateModel();
        model.userNameOrEmailAddress = values.userNameOrEmailAddress;
        model.password = values.password;
        model.rememberClient = values.rememberMe;
        await authenticate(model);
      } finally {
        setSubmitting(false);
      }
    },
    [authenticate],
  );

  const exts = (
    extProvidersLoaded ? externalLoginProviders : []
  ) as ExternalLoginProviderInfoModel[];

  return (
    <>
      <div className="login-form">
        <div className="pb-13 pt-lg-0 pt-5">
          <h3 className="fw-bolder text-gray-900 fs-h4 fs-h1-lg">
            {L("LogIn")}
          </h3>
        </div>

        <form className="login-form form" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5">
            <input
              className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
              type="text"
              placeholder={L("UserNameOrEmail")}
              autoComplete="username"
              {...register("userNameOrEmailAddress", { required: true })}
            />
          </div>

          <div className="mb-5" data-kt-password-meter="true">
            <div className="position-relative mb-3">
              <input
                className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
                type={showPassword ? "text" : "password"}
                placeholder={L("Password")}
                autoComplete="current-password"
                maxLength={32}
                {...register("password", { required: true })}
              />
              <button
                type="button"
                aria-pressed={showPassword}
                aria-label={
                  showPassword ? L("HidePassword") : L("ShowPassword")
                }
                onClick={() => setShowPassword((s) => !s)}
                className="btn btn-sm btn-icon position-absolute translate-middle top-50 end-0 me-n2"
                style={{ transform: "translateY(-50%)" }}
              >
                <i
                  className={`fas ${showPassword ? "fa-eye" : "fa-eye-slash"} fs-4`}
                />
              </button>
            </div>
          </div>

          <div className="mb-5 d-flex justify-content-between mt-4">
            <label className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                {...register("rememberMe")}
              />
              <span className="form-check-label">{L("RememberMe")}</span>
            </label>
            <Link
              to="/account/forgot-password"
              className="text-primary fs-h6 fw-bolder text-hover-primary"
            >
              {L("ForgotPassword")}
            </Link>
          </div>

          <div className="pb-lg-0 pb-5">
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="btn w-100 btn-primary fw-bolder fs-h6 px-8 py-4 my-3 me-3"
            >
              {L("LogIn")}
            </button>
          </div>
        </form>

        {(multiTenancySideIsTenant || !isMultiTenancyEnabled) &&
          exts.length > 0 && (
            <>
              <div className="mt-10 mb-2">
                <div className="divider">
                  <span>{L("LoginWith")}</span>
                </div>
              </div>
              <div className="pb-lg-0 pb-5 login__options">
                {exts.map((p) => (
                  <button
                    key={p.name}
                    className="btn btn-sm btn-light-primary fw-bolder py-2 mb-2 ml-0 me-2"
                    onClick={() => startExternalLogin(p)}
                    title={getProviderDisplayName(p.name || "")}
                  >
                    <i className={`fab fa-${getProviderIcon(p.name || "")}`} />{" "}
                    {getProviderDisplayName(p.name || "")}
                  </button>
                ))}
              </div>
            </>
          )}
      </div>

      <div className="mt-5">
        {isPasswordlessLoginEnabled && (
          <div className="mb-2">
            <span>{L("PasswordlessLogin_Description")}</span>{" "}
            <Link to="/account/passwordless-login" id="passwordless-btn">
              {L("ClickHere")}
            </Link>
          </div>
        )}

        {(isSelfRegistrationAllowed ||
          (!multiTenancySideIsTenant && isTenantSelfRegistrationAllowed)) && (
          <div className="mt-2">
            <span>{L("NotAMemberYet")}</span>
          </div>
        )}

        {multiTenancySideIsTenant && isSelfRegistrationAllowed && (
          <>
            <Link to="/account/register">{L("CreateAnAccount")}</Link>
            <span className="pipe-divider">|</span>
          </>
        )}

        {!multiTenancySideIsTenant && (
          <>
            <Link to="/account/select-edition">{L("NewTenant")}</Link>
            <span className="pipe-divider">|</span>
          </>
        )}

        <Link to="/account/email-activation" id="email-activation-btn">
          {L("EmailActivation")}
        </Link>
      </div>
    </>
  );
};

export default LoginPage;
