import React from "react";
import { Form } from "antd";
import { Controller, type Control, type UseFormWatch } from "react-hook-form";
import { TenantSettingsEditDto } from "@api/generated/service-proxies";
import L from "@/lib/L";

interface Props {
  control: Control<TenantSettingsEditDto>;
  watch: UseFormWatch<TenantSettingsEditDto>;
  testEmail: string;
  setTestEmail: (email: string) => void;
  onSendTestEmail: () => void;
}

const EmailSettingsTab: React.FC<Props> = ({
  control,
  watch,
  testEmail,
  setTestEmail,
  onSendTestEmail,
}) => {
  const isMultiTenancyEnabled = abp.multiTenancy.isEnabled;
  const smtpUseAuthentication = watch("email.smtpUseAuthentication");
  const useHostDefaultEmailSettings = watch(
    "email.useHostDefaultEmailSettings",
  );

  return (
    <Form layout="vertical">
      {isMultiTenancyEnabled && (
        <Form.Item className="mb-5">
          <Controller
            name="email.useHostDefaultEmailSettings"
            control={control}
            render={({ field }) => (
              <div className="form-check form-check-custom form-check-solid">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={field.value}
                  onChange={field.onChange}
                  id="useHostDefaultEmailSettings"
                />
                <label
                  className="form-check-label"
                  htmlFor="useHostDefaultEmailSettings"
                >
                  {L("UseHostDefaultEmailSettings")}
                </label>
              </div>
            )}
          />
        </Form.Item>
      )}

      {!useHostDefaultEmailSettings && (
        <>
          <Form.Item className="mb-5" label={L("DefaultFromAddress")}>
            <Controller
              name="email.defaultFromAddress"
              control={control}
              render={({ field }) => (
                <input type="email" {...field} className="form-control" />
              )}
            />
          </Form.Item>
          <Form.Item className="mb-5" label={L("DefaultFromDisplayName")}>
            <Controller
              name="email.defaultFromDisplayName"
              control={control}
              render={({ field }) => (
                <input type="text" {...field} className="form-control" />
              )}
            />
          </Form.Item>
          <Form.Item className="mb-5" label={L("SmtpHost")}>
            <Controller
              name="email.smtpHost"
              control={control}
              render={({ field }) => (
                <input type="text" {...field} className="form-control" />
              )}
            />
          </Form.Item>
          <div className="mb-5">
            <label className="form-label" htmlFor="SmtpPort">
              {L("SmtpPort")}
            </label>
            <Controller
              name="email.smtpPort"
              control={control}
              render={({ field }) => (
                <input
                  id="SmtpPort"
                  type="number"
                  {...field}
                  className="form-control"
                  maxLength={5}
                />
              )}
            />
          </div>
          <Form.Item>
            <Controller
              name="email.smtpEnableSsl"
              control={control}
              render={({ field }) => (
                <div className="form-check form-check-custom form-check-solid">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={field.value}
                    onChange={field.onChange}
                    id="smtpEnableSsl"
                  />
                  <label className="form-check-label" htmlFor="smtpEnableSsl">
                    {L("UseSsl")}
                  </label>
                </div>
              )}
            />
          </Form.Item>
          <Form.Item>
            <Controller
              name="email.smtpUseAuthentication"
              control={control}
              render={({ field }) => (
                <div className="form-check form-check-custom form-check-solid">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={field.value}
                    onChange={field.onChange}
                    id="smtpUseAuthentication"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="smtpUseAuthentication"
                  >
                    {L("UseAuthentication")}
                  </label>
                </div>
              )}
            />
          </Form.Item>
          {smtpUseAuthentication && (
            <>
              <Form.Item className="mb-5" label={L("DomainName")}>
                <Controller
                  name="email.smtpDomain"
                  control={control}
                  render={({ field }) => (
                    <input type="text" {...field} className="form-control" />
                  )}
                />
              </Form.Item>
              <Form.Item className="mb-5" label={L("UserName")}>
                <Controller
                  name="email.smtpUserName"
                  control={control}
                  render={({ field }) => (
                    <input type="text" {...field} className="form-control" />
                  )}
                />
              </Form.Item>
              <Form.Item className="mb-5" label={L("Password")}>
                <Controller
                  name="email.smtpPassword"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="password"
                      {...field}
                      className="form-control"
                    />
                  )}
                />
              </Form.Item>
            </>
          )}
        </>
      )}

      <hr />
      <h5 className="mt-5">{L("TestEmailSettingsHeader")}</h5>
      <div className="row">
        <div className="col-md-4">
          <Form.Item className="mb-5">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="form-control"
              maxLength={256}
              placeholder={L("EmailAddress") ?? undefined}
            />
          </Form.Item>
        </div>
        <div className="col-md-2 mb-5">
          <button
            type="button"
            disabled={
              !testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)
            }
            className="btn btn-primary"
            onClick={onSendTestEmail}
          >
            {L("SendTestEmail")}
          </button>
        </div>
      </div>
    </Form>
  );
};

export default EmailSettingsTab;
