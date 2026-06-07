import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AccountServiceProxy,
  SendEmailActivationLinkInput,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import recaptcha from "@/lib/recaptcha-v3";

const EmailActivationPage: React.FC = () => {
  const navigate = useNavigate();
  const accountService = useServiceProxy(AccountServiceProxy, []);

  const [emailAddress, setEmailAddress] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    recaptcha.setCaptchaVisibilityOnEmailActivation();
  }, []);

  const canSubmit = useMemo(
    () => !!emailAddress && /.+@.+\..+/.test(emailAddress),
    [emailAddress],
  );

  const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault();
      if (!canSubmit || saving) return;
      setSaving(true);
      try {
        const input = new SendEmailActivationLinkInput();
        input.emailAddress = emailAddress;
        if (recaptcha.useCaptchaOnEmailActivation()) {
          input.captchaResponse =
            (await recaptcha.execute("emailActivation")) || undefined;
        }
        await accountService.sendEmailActivationLink(input);
        navigate("/account/login");
        await abp.message.success(
          L("ActivationMailSentIfEmailAssociatedMessage"),
          L("MailSent"),
        );
      } finally {
        setSaving(false);
      }
    },
    [accountService, canSubmit, emailAddress, navigate, saving],
  );

  return (
    <div className="login-form" style={{ maxWidth: 480 }}>
      <div className="pb-13 pt-lg-0 pt-5">
        <h3 className="fw-bolder text-gray-900 fs-h4 fs-h1-lg">
          {L("EmailActivation")}
        </h3>
      </div>

      <form
        className="login-form form"
        method="post"
        noValidate
        onSubmit={onSubmit}
      >
        <p>{L("SendEmailActivationLink_Information")}</p>

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
            className="btn btn-light-primary fw-bolder fs-h6 px-8 py-4 my-3"
            to="/account/login"
          >
            <i className="fa fa-arrow-left" /> {L("Back")}
          </Link>
          <button
            type="submit"
            className="btn btn-primary fw-bolder fs-h6 px-8 py-4 my-3 me-3 ms-3"
            disabled={!canSubmit || saving}
          >
            <i className="fa fa-check" /> {L("Submit")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailActivationPage;
