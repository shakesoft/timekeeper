import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AccountServiceProxy,
  AuthenticateModel,
  GetPasswordComplexitySettingOutput,
  PasswordComplexitySetting,
  ProfileServiceProxy,
  RegisterInput,
  RegisterOutput,
} from "@api/generated/service-proxies";
import { useLoginService } from "../login/login.service";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import recaptcha from "@/lib/recaptcha-v3";

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const accountService = useServiceProxy(AccountServiceProxy, []);
  const profileService = useServiceProxy(ProfileServiceProxy, []);
  const { authenticate } = useLoginService();

  const [model, setModel] = useState<RegisterInput>(() => new RegisterInput());
  const [passwordComplexity, setPasswordComplexity] =
    useState<PasswordComplexitySetting>(() => new PasswordComplexitySetting());
  const [saving, setSaving] = useState(false);
  const [passwordRepeat, setPasswordRepeat] = useState("");

  useEffect(() => {
    const tenantId = abp?.session?.tenantId || null;
    if (!tenantId) {
      navigate("/account/login");
      return;
    }
    profileService
      .getPasswordComplexitySetting()
      .then((res: GetPasswordComplexitySettingOutput) =>
        setPasswordComplexity(res.setting as PasswordComplexitySetting),
      )
      .catch(() => {});
  }, [navigate, profileService]);

  useEffect(() => {
    recaptcha.setCaptchaVisibilityOnRegister();
  }, []);

  const canSubmit = useMemo(() => {
    const hasRequired =
      !!model.name &&
      !!model.surname &&
      !!model.emailAddress &&
      !!model.userName &&
      !!model.password;
    const emailValid =
      !!model.emailAddress && /.+@.+\..+/.test(model.emailAddress);
    const passMatch = (model.password || "") === (passwordRepeat || "");
    return hasRequired && emailValid && passMatch;
  }, [model, passwordRepeat]);

  const onChange = useCallback((changes: Partial<RegisterInput>) => {
    setModel((prev) => new RegisterInput({ ...prev, ...changes }));
  }, []);

  const save = useCallback(async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    try {
      const input = new RegisterInput();
      input.name = model.name;
      input.surname = model.surname;
      input.emailAddress = model.emailAddress;
      input.userName = model.userName;
      input.password = model.password;

      if (recaptcha.useCaptchaOnRegister()) {
        input.captchaResponse =
          (await recaptcha.execute("register")) || undefined;
      }

      const result: RegisterOutput = await accountService.register(input);
      if (!result.canLogin) {
        abp?.message?.success?.(L("SuccessfullyRegistered"));
        navigate("/account/login");
        return;
      }

      const authModel = new AuthenticateModel();
      authModel.userNameOrEmailAddress = input.userName;
      authModel.password = input.password;
      authModel.rememberClient = false;
      await authenticate(authModel);
    } finally {
      setSaving(false);
    }
  }, [accountService, authenticate, canSubmit, model, navigate, saving]);

  return (
    <div className="login-form">
      <div className="pb-13 pt-lg-0 pt-5">
        <h3 className="fw-bolder text-gray-900 fs-h4 fs-h1-lg">
          {L("SignUp")}
        </h3>
      </div>

      <form
        className="login-form form"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <div className="mb-5">
          <input
            className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
            autoFocus
            type="text"
            placeholder={L("Name")}
            value={model.name || ""}
            onChange={(e) => onChange({ name: e.target.value })}
            maxLength={64}
            required
          />
        </div>

        <div className="mb-5">
          <input
            className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
            type="text"
            placeholder={L("Surname")}
            value={model.surname || ""}
            onChange={(e) => onChange({ surname: e.target.value })}
            maxLength={64}
            required
          />
        </div>

        <div className="mb-5">
          <input
            className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
            type="email"
            placeholder={L("EmailAddress")}
            value={model.emailAddress || ""}
            onChange={(e) => onChange({ emailAddress: e.target.value })}
            maxLength={256}
            required
          />
        </div>

        <div className="mb-5">
          <input
            className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
            type="text"
            autoComplete="new-password"
            placeholder={L("UserName")}
            value={model.userName || ""}
            onChange={(e) => onChange({ userName: e.target.value })}
            maxLength={256}
            required
          />
        </div>

        <div className="mb-5" data-kt-password-meter="true">
          <div className="position-relative mb-3">
            <input
              className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
              type="password"
              placeholder={L("Password")}
              autoComplete="new-password"
              value={model.password || ""}
              onChange={(e) => onChange({ password: e.target.value })}
              required
            />
            <span className="btn btn-sm btn-icon position-absolute translate-middle top-50 end-0 me-n2">
              <i className="fas fa-eye-slash fs-4" />
              <i className="fas fa-eye d-none fs-4" />
            </span>
          </div>
          {!!passwordComplexity?.requiredLength && (
            <div className="text-muted fs-7">
              {L("PasswordComplexity_RequiredLength_Hint", {
                0: passwordComplexity.requiredLength,
              })}
            </div>
          )}
        </div>

        <div className="mb-5">
          <input
            className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
            type="password"
            placeholder={L("PasswordRepeat")}
            value={passwordRepeat}
            onChange={(e) => setPasswordRepeat(e.target.value)}
            required
          />
          {model.password &&
          passwordRepeat &&
          model.password !== passwordRepeat ? (
            <div className="form-text text-danger">
              {L("PasswordsDontMatch")}
            </div>
          ) : null}
        </div>

        <div className="pb-lg-0 pb-5">
          <Link
            to="/account/login"
            className="btn btn-light-primary fw-bolder fs-h6 px-8 py-4 my-3"
          >
            <i className="fa fa-arrow-left"></i> {L("Back")}
          </Link>
          <button
            type="submit"
            className="btn btn-primary fw-bolder fs-h6 px-8 py-4 my-3 ms-3"
            disabled={!canSubmit || saving}
          >
            <i className="fa fa-check"></i>{" "}
            {saving ? L("SavingWithThreeDot") : L("Submit")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
