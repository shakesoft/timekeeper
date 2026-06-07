import React, { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AccountServiceProxy,
  SendPasswordResetCodeInput,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const account = useServiceProxy(AccountServiceProxy, []);

  const [emailAddress, setEmailAddress] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const isEmailValid = useMemo(
    () => /.+@.+\..+/.test(emailAddress),
    [emailAddress],
  );

  const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      if (!isEmailValid || saving) return;
      setSaving(true);
      try {
        const input = new SendPasswordResetCodeInput();
        input.emailAddress = emailAddress;
        await account.sendPasswordResetCode(input);
        navigate("/account/login");
        await abp.message.success(
          L("PasswordResetMailSentMessage"),
          L("MailSent"),
        );
      } finally {
        setSaving(false);
      }
    },
    [account, emailAddress, isEmailValid, navigate, saving],
  );

  return (
    <div className="login-form" style={{ maxWidth: 480 }}>
      <div className="pb-13 pt-lg-0 pt-5">
        <h3 className="fw-bolder text-gray-900 fs-h4 fs-h1-lg">
          {L("ForgotPassword")}
        </h3>
      </div>

      <form
        className="login-form form"
        method="post"
        noValidate
        onSubmit={onSubmit}
      >
        <p>{L("SendPasswordResetLink_Information")}</p>

        <div className="mb-5">
          <input
            className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
            type="email"
            placeholder={L("EmailAddress")}
            name="emailAddress"
            autoComplete="email"
            required
            maxLength={256}
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
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
            disabled={!isEmailValid || saving}
          >
            <i className="fa fa-check" /> {L("Submit")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
