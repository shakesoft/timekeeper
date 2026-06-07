import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  PasswordComplexitySetting,
  ProfileServiceProxy,
  RegisterTenantInput,
  RegisterTenantOutput,
  TenantRegistrationServiceProxy,
  SubscriptionStartType,
  PaymentPeriodType,
  EditionSelectDto,
  GetPasswordComplexitySettingOutput,
} from "../../../../api/generated/service-proxies";
import tenantRegistrationHelper from "../tenant-registration-helper";
import AppConsts from "../../../../lib/app-consts";
import recaptcha from "@/lib/recaptcha-v3";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { getPasswordComplexityErrors } from "@/lib/password-complexity";

const RegisterTenantPage: React.FC = () => {
  const profileService = useServiceProxy(ProfileServiceProxy, []);
  const tenantRegistrationService = useServiceProxy(
    TenantRegistrationServiceProxy,
    [],
  );
  const navigate = useNavigate();
  const location = useLocation();

  const search = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const [passwordComplexitySetting, setPwdComplexity] =
    useState<PasswordComplexitySetting>(new PasswordComplexitySetting());
  const [edition, setEdition] = useState<EditionSelectDto | undefined>(
    undefined,
  );

  const [saving, setSaving] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [model, setModel] = useState<RegisterTenantInput>(() => {
    const m = new RegisterTenantInput();
    const editionId = Number(search.get("editionId"));
    m.editionId = Number.isFinite(editionId) ? editionId : undefined;
    const start = Number(search.get("subscriptionStartType"));
    m.subscriptionStartType = Number.isFinite(start)
      ? start
      : SubscriptionStartType.Free;
    const ppt = search.get("paymentPeriodType");
    m.paymentPeriodType =
      ppt === "annual" ? PaymentPeriodType.Annual : PaymentPeriodType.Monthly;
    return m;
  });

  useEffect(() => {
    profileService
      .getPasswordComplexitySetting()
      .then((res: GetPasswordComplexitySettingOutput) =>
        setPwdComplexity(res.setting as PasswordComplexitySetting),
      );
  }, [profileService]);

  useEffect(() => {
    recaptcha.setCaptchaVisibilityOnRegister();
  }, []);

  useEffect(() => {
    if (model.editionId) {
      tenantRegistrationService
        .getEdition(model.editionId)
        .then((e) => setEdition(e));
    }
  }, [model.editionId, tenantRegistrationService]);

  const onChange = useCallback((patch: Partial<RegisterTenantInput>) => {
    setModel((prev) => Object.assign(new RegisterTenantInput(prev), patch));
  }, []);

  const passwordErrors = useMemo(() => {
    const pwd = model.adminPassword || "";
    return getPasswordComplexityErrors(pwd, passwordComplexitySetting);
  }, [model.adminPassword, passwordComplexitySetting]);

  const doPasswordsMatch = useMemo(
    () => (model.adminPassword || "") === (confirmPassword || ""),
    [confirmPassword, model.adminPassword],
  );

  const canSubmit = useMemo(() => {
    return (
      !!model.tenancyName &&
      !!model.name &&
      !!model.adminEmailAddress &&
      !!model.adminPassword &&
      doPasswordsMatch &&
      passwordErrors.length === 0
    );
  }, [doPasswordsMatch, model, passwordErrors.length]);

  const submit = useCallback(async () => {
    if (!canSubmit || saving) return;
    setSaving(true);
    try {
      const input = new RegisterTenantInput(model);
      if (recaptcha.useCaptchaOnRegister()) {
        input.captchaResponse = await recaptcha.execute("register");
        recaptcha.setCaptchaVisibilityOnRegister();
      }
      input.successUrl = `${AppConsts.appBaseUrl}/account/buy-succeed`;
      input.errorUrl = `${AppConsts.appBaseUrl}/account/payment-failed`;
      const result = await tenantRegistrationService.registerTenant(input);
      tenantRegistrationHelper.set(result as RegisterTenantOutput);
      if (
        String(model.subscriptionStartType) ===
          String(SubscriptionStartType.Paid) &&
        result.paymentId
      ) {
        navigate(
          `/account/gateway-selection?paymentId=${encodeURIComponent(
            String(result.paymentId),
          )}`,
        );
      } else {
        navigate("/account/register-tenant-result");
      }
    } finally {
      setSaving(false);
    }
  }, [canSubmit, model, navigate, saving, tenantRegistrationService]);

  return (
    <div className="login-form">
      <div className="pb-13 pt-lg-0 pt-5">
        <h3 className="fw-bolder text-gray-900 fs-h4 fs-h1-lg">
          {L("TenantSignUp")}
        </h3>
      </div>

      {edition && (
        <div className="row">
          <div className="col-sm-12 col-md-8">
            <span className="d-block text-muted pt-2 fs-sm">
              {L("Edition")}
            </span>
            <h3 className="pb-10">{edition.displayName}</h3>
          </div>
          <div className="col-sm-12 col-md-4 text-end">
            <Link
              to="/account/login"
              className="btn btn-light-primary btn-elevate fw-bolder"
            >
              {L("Back")}
            </Link>
          </div>
        </div>
      )}

      <div className="separator separator-border-dashed" />

      <div className="form mt-2">
        <h5 className="mt-2">{L("TenantInformations")}</h5>

        <div className="mb-5">
          <input
            className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
            autoFocus
            type="text"
            placeholder={L("TenancyName") + " *"}
            value={model.tenancyName || ""}
            onChange={(e) => onChange({ tenancyName: e.target.value })}
            maxLength={64}
          />
        </div>

        <div className="mb-5">
          <input
            className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
            type="text"
            placeholder={L("TenantName") + " *"}
            value={model.name || ""}
            onChange={(e) => onChange({ name: e.target.value })}
            maxLength={128}
          />
        </div>

        <h5 className="mt-2">{L("AccountSettings")}</h5>

        <div className="mb-5">
          <input
            className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
            type="text"
            placeholder={L("AdminName") + " *"}
            value={model.adminName || ""}
            onChange={(e) => onChange({ adminName: e.target.value })}
            maxLength={64}
          />
        </div>

        <div className="mb-5">
          <input
            className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
            type="text"
            placeholder={L("AdminSurname") + " *"}
            value={model.adminSurname || ""}
            onChange={(e) => onChange({ adminSurname: e.target.value })}
            maxLength={64}
          />
        </div>

        <div className="mb-5">
          <input
            className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
            type="email"
            placeholder={L("AdminEmailAddress") + " *"}
            value={model.adminEmailAddress || ""}
            onChange={(e) => onChange({ adminEmailAddress: e.target.value })}
            maxLength={256}
          />
        </div>

        <div className="mb-5">
          <input
            type="password"
            className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
            placeholder={L("AdminPassword") + " *"}
            value={model.adminPassword || ""}
            onChange={(e) => onChange({ adminPassword: e.target.value })}
            maxLength={128}
          />
          {model.adminPassword ? (
            passwordErrors.length > 0 ? (
              <div className="mt-2" style={{ fontSize: 12 }}>
                {passwordErrors.map((msg, idx) => (
                  <div key={idx} className="form-text text-danger text-left">
                    {msg}
                  </div>
                ))}
              </div>
            ) : null
          ) : null}
        </div>

        <div className="mb-5">
          <input
            type="password"
            className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
            placeholder={L("PasswordRepeat") + " *"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            maxLength={128}
          />
          {!doPasswordsMatch && confirmPassword ? (
            <div
              className="form-text text-danger text-left"
              style={{ fontSize: 12 }}
            >
              {L("PasswordsDontMatch")}
            </div>
          ) : null}
        </div>

        <div className="pb-lg-0 pb-5">
          <button
            type="button"
            className="btn w-100 btn-primary fw-bolder fs-h6 px-8 py-4 mb-5"
            disabled={!canSubmit || saving}
            onClick={submit}
          >
            <i className="fa fa-check"></i>
            {L("Submit")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterTenantPage;
