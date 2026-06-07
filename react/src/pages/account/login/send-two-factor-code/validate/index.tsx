import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginService } from "../../login.service";
import L from "@/lib/L";
import { useSession } from "@/hooks/useSession";

const ValidateTwoFactorCodePage: React.FC = () => {
  const navigate = useNavigate();
  const { application } = useSession();

  const { canProceedTwoFactor, finalizeTwoFactor } = useLoginService();

  const [code, setCode] = useState("");
  const [rememberClient, setRememberClient] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const twoFactorCodeExpireSeconds =
      (application?.twoFactorCodeExpireSeconds as number) || 90;
    return twoFactorCodeExpireSeconds;
  });

  useEffect(() => {
    if (!canProceedTwoFactor) {
      navigate("/account/login");
      return;
    }
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
  }, [canProceedTwoFactor, navigate]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!code) return;
      setSubmitting(true);
      try {
        await finalizeTwoFactor(code, rememberClient, null);
      } finally {
        setSubmitting(false);
      }
    },
    [code, finalizeTwoFactor, rememberClient],
  );

  const isRememberBrowserEnabled = !!abp?.setting?.getBoolean(
    "Abp.Zero.UserManagement.TwoFactorLogin.IsRememberBrowserEnabled",
  );

  return (
    <div className="login-form">
      <div className="pb-13 pt-lg-0 pt-5">
        <h3>{L("VerifySecurityCode")}</h3>
      </div>
      <form className="login-form form" onSubmit={onSubmit}>
        <div className="mb-5">
          <input
            autoFocus
            className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
            type="password"
            autoComplete="one-time-code"
            placeholder={L("Code")}
            name="code"
            required
            maxLength={16}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        {isRememberBrowserEnabled && (
          <div className="mb-5 mt-4">
            <label className="form-check form-check-custom form-check-solid py-1">
              <input
                type="checkbox"
                name="rememberClient"
                className="form-check-input"
                checked={rememberClient}
                onChange={(e) => setRememberClient(e.target.checked)}
                value="true"
              />
              <span className="form-check-label">
                {L("RememberThisBrowser")}
              </span>
            </label>
          </div>
        )}

        <div className="pb-lg-0 pb-5">
          <button
            type="submit"
            className="btn btn-primary fw-bolder fs-h6 px-8 py-4 my-3 me-3"
            disabled={!code || submitting}
          >
            {L("Submit")}
          </button>
          {remainingSeconds >= 0 && (
            <span className="text-danger ml-5">
              {L("RemainingTime")}: {L("SecondShort{0}", [remainingSeconds])}.
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default ValidateTwoFactorCodePage;
