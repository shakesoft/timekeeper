import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginService } from "../login.service";
import {
  TokenAuthServiceProxy,
  SendTwoFactorAuthCodeModel,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

const SendTwoFactorCodePage: React.FC = () => {
  const navigate = useNavigate();
  const { twoFactorAuthProviders, twoFactorUserId, canProceedTwoFactor } =
    useLoginService();

  const tokenAuthService = useServiceProxy(TokenAuthServiceProxy, []);

  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (
      !canProceedTwoFactor ||
      !twoFactorAuthProviders ||
      twoFactorAuthProviders.length === 0
    ) {
      navigate("/account/login");
      return;
    }
    setSelectedProvider(twoFactorAuthProviders[0] || "");
  }, [canProceedTwoFactor, navigate, twoFactorAuthProviders]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedProvider || !twoFactorUserId) return;
      setSubmitting(true);
      try {
        await tokenAuthService.sendTwoFactorAuthCode(
          new SendTwoFactorAuthCodeModel({
            userId: twoFactorUserId,
            provider: selectedProvider,
          }),
        );
        navigate("/account/verify-code");
      } finally {
        setSubmitting(false);
      }
    },
    [navigate, selectedProvider, tokenAuthService, twoFactorUserId],
  );

  return (
    <div className="login-form">
      <div className="pb-13 pt-lg-0 pt-5">
        <h3 className="fw-bolder text-gray-900 fs-h4 fs-h1-lg">
          {L("SendSecurityCode")}
        </h3>
      </div>
      {!!twoFactorAuthProviders?.length && (
        <form className="login-form form" onSubmit={onSubmit}>
          <p>{L("SendSecurityCode_Information")}</p>
          <div className="mb-5">
            <select
              autoFocus
              className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
            >
              {twoFactorAuthProviders.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="pb-lg-0 pb-5">
            <button
              type="submit"
              disabled={!selectedProvider || submitting}
              className="btn btn-primary fw-bolder fs-h6 px-8 py-4 my-3 me-3"
            >
              {L("Submit")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SendTwoFactorCodePage;
