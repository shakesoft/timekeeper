import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AccountServiceProxy,
  PasswordlessLoginProviderType,
  SendPasswordlessLoginCodeInput,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

type ProviderOption = { value: PasswordlessLoginProviderType; key: string };

const PasswordlessLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const accountService = useServiceProxy(AccountServiceProxy, []);

  const isEmailEnabled: boolean = !!abp?.setting?.getBoolean(
    "App.UserManagement.PasswordlessLogin.IsEmailPasswordlessLoginEnabled",
  );
  const isSmsEnabled: boolean = !!abp?.setting?.getBoolean(
    "App.UserManagement.PasswordlessLogin.IsSmsPasswordlessLoginEnabled",
  );

  const providerOptions: ProviderOption[] = useMemo(() => {
    return (
      Object.keys(PasswordlessLoginProviderType).filter((k) =>
        isNaN(Number(k)),
      ) as Array<keyof typeof PasswordlessLoginProviderType>
    ).map((key) => ({ value: PasswordlessLoginProviderType[key], key }));
  }, []);

  const [selectedProvider, setSelectedProvider] =
    useState<PasswordlessLoginProviderType>(
      isEmailEnabled
        ? PasswordlessLoginProviderType.Email
        : PasswordlessLoginProviderType.Sms,
    );
  const [inputValue, setInputValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEmailEnabled) {
      setSelectedProvider(PasswordlessLoginProviderType.Email);
    } else {
      setSelectedProvider(PasswordlessLoginProviderType.Sms);
    }
  }, [isEmailEnabled]);

  const getProviderKey = useCallback(
    (value: PasswordlessLoginProviderType): string => {
      const found = providerOptions.find((p) => p.value === value);
      return found ? found.key : "";
    },
    [providerOptions],
  );

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue) {
        return;
      }
      setSubmitting(true);
      try {
        const model = new SendPasswordlessLoginCodeInput();
        model.providerValue = inputValue;
        model.providerType = selectedProvider as PasswordlessLoginProviderType;
        await accountService.sendPasswordlessLoginCode(model);

        const providerText = getProviderKey(selectedProvider);
        const params = new URLSearchParams({
          selectedProviderInputValue: inputValue,
          selectedProvider: providerText,
        });
        navigate(`/account/verify-passwordless-login?${params.toString()}`);
      } finally {
        setSubmitting(false);
      }
    },
    [accountService, getProviderKey, inputValue, navigate, selectedProvider],
  );

  const showProviderSelect = isEmailEnabled && isSmsEnabled;
  const isEmailSelected =
    Number(selectedProvider) === PasswordlessLoginProviderType.Email;
  const isSmsSelected =
    Number(selectedProvider) === PasswordlessLoginProviderType.Sms;

  return (
    <div className="login-form">
      <div className="pb-13 pt-lg-0 pt-5">
        <h3 className="fw-bolder text-gray-900 fs-h4 fs-h1-lg">
          {L("PasswordlessLogin")}
        </h3>
      </div>

      <form className="login-form form" onSubmit={onSubmit}>
        {showProviderSelect && (
          <div>
            <p>{L("SelectPasswordlessLogin_Information")}</p>
            <div className="mb-5">
              <select
                autoFocus
                size={1}
                className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
                value={selectedProvider}
                onChange={(e) =>
                  setSelectedProvider(
                    Number(e.target.value) as PasswordlessLoginProviderType,
                  )
                }
                name="selectedPasswordlessLoginProvider"
              >
                {providerOptions.map((provider) => (
                  <option key={provider.key} value={provider.value}>
                    {provider.key}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {isEmailSelected && (
          <div>
            <p>{L("PasswordlessLogin_EmailAddress_Information")}</p>
            <div className="mb-5">
              <input
                autoFocus={!showProviderSelect}
                className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
                type="text"
                autoComplete="email"
                placeholder={L("EmailAddress")}
                name="selectedProviderInputValue"
                required
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          </div>
        )}

        {isSmsSelected && (
          <div>
            <p>{L("PasswordlessLogin_PhoneNumber_Information")}</p>
            <div className="mb-5">
              <input
                autoFocus={!showProviderSelect}
                className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
                type="text"
                autoComplete="tel"
                placeholder={L("PhoneNumber")}
                name="selectedProviderInputValue"
                required
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="pb-lg-0 pb-5">
          <button
            type="submit"
            className="btn btn-primary fw-bolder fs-h6 px-8 py-4 my-3 me-3"
            disabled={submitting || !inputValue}
          >
            {L("Submit")}
          </button>
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

export default PasswordlessLoginPage;
