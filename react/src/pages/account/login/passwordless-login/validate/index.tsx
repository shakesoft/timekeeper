import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AccountServiceProxy,
  PasswordlessAuthenticateModel,
  PasswordlessAuthenticateResultModel,
  TokenAuthServiceProxy,
  VerifyPasswordlessLoginCodeInput,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import { useSession } from "@/hooks/useSession";
import { setAuthTokens, setRefreshToken } from "@/lib/auth-helpers";
import L from "@/lib/L";
import recaptcha from "@/lib/recaptcha-v3";
import { updateSignalRQueryString } from "@/lib/signalr-helper";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ValidatePasswordlessLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const q = useQuery();
  const { application } = useSession();

  const accountService = useServiceProxy(AccountServiceProxy, []);
  const tokenAuth = useServiceProxy(TokenAuthServiceProxy, []);

  const [passwordlessCode, setPasswordlessCode] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    application?.passwordlessLoginCodeExpireSeconds || 90,
  );
  const [submitting, setSubmitting] = useState(false);

  const selectedProviderInputValue = q.get("selectedProviderInputValue") || "";
  const selectedProvider = q.get("selectedProvider") || "";

  useEffect(() => {
    if (application?.passwordlessLoginCodeExpireSeconds) {
      setRemainingSeconds(application.passwordlessLoginCodeExpireSeconds);
    }
  }, [application?.passwordlessLoginCodeExpireSeconds]);

  useEffect(() => {
    recaptcha.setCaptchaVisibilityOnLogin();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setRemainingSeconds((s) => {
        const next = s - 1;
        if (next === 0) {
          abp?.message?.warn?.(L("TimeoutPleaseTryAgain"));
          navigate("/account/login");
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [navigate]);

  const processAuthResult = useCallback(
    (result: PasswordlessAuthenticateResultModel) => {
      const token = result?.accessToken;
      const encryptedAccessToken = result?.encryptedAccessToken;
      const refreshToken = result?.refreshToken;

      if (token) {
        setAuthTokens(token, encryptedAccessToken || "");

        if (encryptedAccessToken) {
          updateSignalRQueryString(encryptedAccessToken);
        }

        setRefreshToken(refreshToken, result.refreshTokenExpireInSeconds, true);
      }

      const redirectUrl = result?.returnUrl || "";
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        window.location.href = "/app";
      }
    },
    [],
  );

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedProviderInputValue || !passwordlessCode) {
        return;
      }
      setSubmitting(true);
      try {
        const verifyModel = new VerifyPasswordlessLoginCodeInput();
        verifyModel.providerValue = selectedProviderInputValue;
        verifyModel.code = passwordlessCode;
        await accountService.verifyPasswordlessLoginCode(verifyModel);

        const singleSignIn =
          new URLSearchParams(window.location.search).get("singleSignIn") ===
          "true";
        const returnUrl =
          new URLSearchParams(window.location.search).get("returnUrl") ||
          undefined;

        const authModel = new PasswordlessAuthenticateModel();
        authModel.providerValue = selectedProviderInputValue;
        authModel.provider = selectedProvider;
        authModel.verificationCode = passwordlessCode;
        authModel.singleSignIn = singleSignIn;
        authModel.returnUrl = returnUrl;

        // Execute reCAPTCHA if enabled on login
        if (recaptcha.useCaptchaOnLogin()) {
          try {
            const captchaToken = await recaptcha.execute("login");
            authModel.captchaResponse = captchaToken;
          } catch {
            // proceed without captcha if execution fails
          }
        }

        const result = await tokenAuth.passwordlessAuthenticate(authModel);
        processAuthResult(result);
      } finally {
        setSubmitting(false);
      }
    },
    [
      accountService,
      passwordlessCode,
      processAuthResult,
      selectedProvider,
      selectedProviderInputValue,
      tokenAuth,
    ],
  );

  return (
    <div className="login-form">
      <div className="pb-13 pt-lg-0 pt-5">
        <h3>{L("VerifyPasswordlessCode")}</h3>
      </div>
      <p className="pb-5">
        {L("ConfirmationPasswordlessCodeSentTo", selectedProviderInputValue)}
      </p>
      <form className="login-form form" onSubmit={onSubmit}>
        <div className="mb-5">
          <input
            autoFocus
            className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
            type="text"
            autoComplete="one-time-code"
            placeholder={L("Code")}
            name="passwordlessCode"
            required
            maxLength={6}
            value={passwordlessCode}
            onChange={(e) => setPasswordlessCode(e.target.value)}
          />
        </div>

        <div className="pb-lg-0 pb-5">
          <button
            type="submit"
            className="btn btn-primary fw-bolder fs-h6 px-8 py-4 my-3 me-3"
            disabled={!passwordlessCode || submitting}
          >
            {L("Submit")}
          </button>
          {remainingSeconds >= 0 && (
            <span
              className={
                "remaining-time-counter ml-5" +
                (remainingSeconds <= 15 ? " text-danger fw-bold" : "")
              }
            >
              {L("RemainingTime")}: {remainingSeconds}
            </span>
          )}
        </div>

        <div className="mt-5">
          <Link to="/account/login" className="text-primary fw-bolder">
            <i className="fa fa-arrow-left" /> {L("Back")}
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ValidatePasswordlessLoginPage;
