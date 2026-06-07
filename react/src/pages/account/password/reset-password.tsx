import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  AccountServiceProxy,
  ProfileServiceProxy,
  PasswordComplexitySetting,
  ResetPasswordOutput,
  ResetPasswordInput,
  ResolveTenantIdInput,
  AuthenticateModel,
} from "@api/generated/service-proxies";
import { useLoginService } from "../login/login.service";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import recaptcha from "@/lib/recaptcha-v3";
import { getDate } from "@/pages/admin/components/common/timing/lib/datetime-helper";

type ResetFormValues = {
  password: string;
  passwordRepeat: string;
};

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const account = useServiceProxy(AccountServiceProxy, []);
  const profile = useServiceProxy(ProfileServiceProxy, []);
  const { authenticate } = useLoginService();

  const [model, setModel] = useState<ResetFormValues>({
    password: "",
    passwordRepeat: "",
  });
  const [complexity, setComplexity] =
    useState<PasswordComplexitySetting | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const cParam = searchParams.get("c");
  const userIdParam = searchParams.get("userId");
  const resetCodeParam = searchParams.get("resetCode");
  const tenantIdParam = searchParams.get("tenantId");

  useEffect(() => {
    profile
      .getPasswordComplexitySetting()
      .then((res) => setComplexity(res.setting));

    (async () => {
      if (cParam) {
        try {
          const tenantId = await account.resolveTenantId(
            new ResolveTenantIdInput({ c: cParam }),
          );
          const current = abp?.multiTenancy?.getTenantIdCookie?.();
          if ((tenantId || null) !== (current || null)) {
            abp?.multiTenancy?.setTenantIdCookie?.(tenantId || undefined);
          }
        } catch {
          abp.message?.error?.(L("AnErrorOccurred"));
        }
      } else if (tenantIdParam) {
        const tenantId = Number.parseInt(tenantIdParam, 10);
        if (!Number.isNaN(tenantId)) {
          abp?.multiTenancy?.setTenantIdCookie?.(tenantId || undefined);
        }
      }
    })();
  }, [account, cParam, profile, tenantIdParam]);

  useEffect(() => {
    recaptcha.setCaptchaVisibilityOnResetPassword();
  }, []);

  const isPasswordValid = useMemo(() => {
    if (!complexity)
      return (
        model.password.length > 0 && model.password === model.passwordRepeat
      );
    const {
      requireDigit,
      requireLowercase,
      requireUppercase,
      requireNonAlphanumeric,
      requiredLength,
    } = complexity;
    const tests = [
      !requiredLength || model.password.length >= requiredLength,
      !requireDigit || /\d/.test(model.password),
      !requireLowercase || /[a-z]/.test(model.password),
      !requireUppercase || /[A-Z]/.test(model.password),
      !requireNonAlphanumeric || /[^a-zA-Z0-9]/.test(model.password),
      model.password === model.passwordRepeat,
    ];
    return tests.every(Boolean);
  }, [complexity, model.password, model.passwordRepeat]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      if (!isPasswordValid || saving) return;
      setSaving(true);
      try {
        const input = new ResetPasswordInput();
        if (cParam) {
          input.c = cParam;
        } else {
          input.userId = parseInt(userIdParam || "0", 10) || 0;
          input.resetCode = resetCodeParam || undefined;
          input.expireDate = getDate();
          const returnUrl =
            new URLSearchParams(window.location.search).get("returnUrl") ||
            undefined;
          const singleSignIn =
            new URLSearchParams(window.location.search).get("singleSignIn") ||
            undefined;
          input.returnUrl = returnUrl;
          input.singleSignIn = singleSignIn;
        }
        input.password = model.password;

        if (recaptcha.useCaptchaOnResetPassword()) {
          const captchaResponse =
            (await recaptcha.execute("resetPassword")) || undefined;
          Object.assign(input, { captchaResponse });
        }
        const result: ResetPasswordOutput = await account.resetPassword(input);
        if (!result.canLogin) {
          navigate("/account/login");
          return;
        }

        const authModel = new AuthenticateModel();
        authModel.userNameOrEmailAddress = result.userName || "";
        authModel.password = model.password;
        authModel.rememberClient = false;
        await authenticate(authModel);
      } finally {
        setSaving(false);
      }
    },
    [
      account,
      authenticate,
      cParam,
      isPasswordValid,
      model.password,
      navigate,
      resetCodeParam,
      saving,
      userIdParam,
    ],
  );

  return (
    <div className="login-form" style={{ maxWidth: 480 }}>
      <div className="pb-13 pt-lg-0 pt-5">
        <h3 className="fw-bolder text-gray-900 fs-h4 fs-h1-lg">
          {L("ChangePassword")}
        </h3>
      </div>

      <form
        className="login-form form"
        method="post"
        noValidate
        onSubmit={onSubmit}
      >
        <p>{L("PleaseEnterYourNewPassword")}</p>

        <div className="mb-5">
          <input
            type="password"
            name="Password"
            className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
            placeholder={L("Password")}
            value={model.password}
            onChange={(e) =>
              setModel((m) => ({ ...m, password: e.target.value }))
            }
            required
          />
        </div>

        <div className="mb-5">
          <input
            type="password"
            name="PasswordRepeat"
            className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
            placeholder={L("PasswordRepeat")}
            value={model.passwordRepeat}
            onChange={(e) =>
              setModel((m) => ({ ...m, passwordRepeat: e.target.value }))
            }
            required
          />
        </div>

        <div className="pb-lg-0 pb-5">
          <Link
            to="/account/login"
            className="btn btn-light-primary fw-bolder fs-h6 px-8 py-4 my-3"
          >
            <i className="fa fa-arrow-left" /> {L("Back")}
          </Link>
          <button
            type="submit"
            className="btn btn-primary fw-bolder fs-h6 px-8 py-4 my-3 me-3 ms-3"
            disabled={!isPasswordValid || saving}
          >
            <i className="fa fa-check" /> {L("Submit")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
