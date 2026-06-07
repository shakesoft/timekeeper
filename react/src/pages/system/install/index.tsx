import React, { useCallback, useEffect, useState } from "react";
import {
  InstallServiceProxy,
  InstallDto,
  EmailSettingsEditDto,
  HostBillingSettingsEditDto,
  NameValue,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";

type SetupSettings = InstallDto;

const defaultLogo = "/assets/common/images/app-logo-on-light.svg";

const InstallPage: React.FC = () => {
  const installService = useServiceProxy(InstallServiceProxy, []);

  const [saving, setSaving] = useState(false);
  const [setupSettings, setSetupSettings] = useState<SetupSettings>(() => {
    const dto = new InstallDto();
    dto.smtpSettings = new EmailSettingsEditDto();
    dto.billInfo = new HostBillingSettingsEditDto();
    dto.defaultLanguage = "en";
    return dto;
  });
  const [languages, setLanguages] = useState<NameValue[]>([]);
  const [adminPasswordRepeat, setAdminPasswordRepeat] = useState("");

  const goToHome = useCallback(() => {
    window.location.href = "/";
  }, []);

  useEffect(() => {
    installService
      .checkDatabase()
      .then((result) => {
        if (result.isDatabaseExist) {
          window.location.href = "/";
        }
      })
      .catch(() => {});

    installService
      .getAppSettingsJson()
      .then((result) => {
        setSetupSettings((prev) => {
          const next = new InstallDto(prev);
          next.webSiteUrl = result?.webSiteUrl ?? next.webSiteUrl ?? "";
          next.serverUrl = result?.serverSiteUrl ?? next.serverUrl ?? "";
          return next;
        });
        setLanguages(result?.languages || []);
      })
      .catch(() => {});
  }, [installService]);

  const onChange = useCallback((changes: Partial<SetupSettings>) => {
    setSetupSettings((prev) => Object.assign(new InstallDto(prev), changes));
  }, []);

  const onChangeSmtp = useCallback((changes: Partial<EmailSettingsEditDto>) => {
    setSetupSettings((prev) => {
      const next = new InstallDto(prev);
      next.smtpSettings = Object.assign(
        new EmailSettingsEditDto(prev.smtpSettings),
        changes,
      );
      return next;
    });
  }, []);

  const onChangeBill = useCallback(
    (changes: Partial<HostBillingSettingsEditDto>) => {
      setSetupSettings((prev) => {
        const next = new InstallDto(prev);
        next.billInfo = Object.assign(
          new HostBillingSettingsEditDto(prev.billInfo),
          changes,
        );
        return next;
      });
    },
    [],
  );

  const saveAll = useCallback(async () => {
    setSaving(true);
    try {
      await installService.setup(setupSettings);
      window.location.href = "/";
    } finally {
      setSaving(false);
    }
  }, [installService, setupSettings]);

  return (
    <div
      className="d-flex flex-column flex-root"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="d-flex flex-column flex-column-fluid bgi-position-y-bottom position-x-center bgi-no-repeat bgi-size-contain bgi-attachment-fixed"
        style={{
          backgroundImage:
            "url(/metronic/assets/media/svg/illustrations/login.png)",
          minHeight: "100vh",
        }}
      >
        <div className="d-flex flex-center flex-column flex-column-fluid">
          <a
            onClick={(e) => {
              e.preventDefault();
              goToHome();
            }}
            href="/"
            className="d-flex justify-content-center mt-10 mb-12"
          >
            <img src={defaultLogo} alt="logo" className="h-40px" />
          </a>

          <div className="container-xxl mx-auto">
            <div className="content col-lg-12">
              <div className="container container-fluid pb-10">
                <div className="card card-custom">
                  <div className="card-body">
                    <div className="symbol symbol-35px mb-5">
                      <span className="symbol-label bg-light-primary">
                        <i className="la la-gear fs-2x text-primary"></i>
                      </span>
                    </div>
                    <h3 className="text-dark fw-bold mb-5">
                      CadentManagement Installation
                    </h3>

                    <form className="form w-100">
                      <div className="mb-5">
                        <label className="form-label required">
                          Connection String
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Connection string"
                          value={setupSettings.connectionString || ""}
                          onChange={(e) =>
                            onChange({
                              connectionString: e.target.value,
                            })
                          }
                          autoComplete="new-password"
                          required
                        />
                      </div>

                      <div className="separator my-4"></div>

                      <div className="mb-5">
                        <label className="form-label required">
                          Admin Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Admin password"
                          value={setupSettings.adminPassword || ""}
                          onChange={(e) =>
                            onChange({ adminPassword: e.target.value })
                          }
                          autoComplete="new-password"
                          required
                        />
                      </div>

                      <div className="mb-5">
                        <label className="form-label required">
                          Repeat Admin Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Repeat admin password"
                          value={adminPasswordRepeat}
                          onChange={(e) =>
                            setAdminPasswordRepeat(e.target.value)
                          }
                          autoComplete="new-password"
                          required
                        />
                      </div>

                      <div className="separator my-4"></div>

                      <div className="mb-5">
                        <label className="form-label required">
                          Client Side URL
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Client side URL"
                          value={setupSettings.webSiteUrl || ""}
                          onChange={(e) =>
                            onChange({ webSiteUrl: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="mb-5">
                        <label className="form-label required">
                          Server Side URL
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Server side URL"
                          value={setupSettings.serverUrl || ""}
                          onChange={(e) =>
                            onChange({ serverUrl: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="separator my-4"></div>

                      <div className="mb-5">
                        <label className="form-label required">
                          Default Language
                        </label>
                        <select
                          className="form-select"
                          value={setupSettings.defaultLanguage}
                          onChange={(e) =>
                            onChange({ defaultLanguage: e.target.value })
                          }
                          required
                        >
                          {languages.map((l) => (
                            <option key={l.value} value={l.value}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="separator my-4"></div>

                      <div className="mb-5">
                        <label className="form-label required">
                          Default From Address
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="example@domain.com"
                          value={
                            setupSettings.smtpSettings?.defaultFromAddress || ""
                          }
                          onChange={(e) =>
                            onChangeSmtp({
                              defaultFromAddress: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="mb-5">
                        <label className="form-label">
                          Default From Display Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Display name"
                          value={
                            setupSettings.smtpSettings
                              ?.defaultFromDisplayName || ""
                          }
                          onChange={(e) =>
                            onChangeSmtp({
                              defaultFromDisplayName: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="mb-5">
                        <label className="form-label">SMTP Host</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="SMTP host"
                          value={setupSettings.smtpSettings?.smtpHost || ""}
                          onChange={(e) =>
                            onChangeSmtp({ smtpHost: e.target.value })
                          }
                        />
                      </div>

                      <div className="mb-5">
                        <label className="form-label">SMTP Port</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="25"
                          value={setupSettings.smtpSettings?.smtpPort || ""}
                          onChange={(e) =>
                            onChangeSmtp({
                              smtpPort: parseInt(e.target.value, 10),
                            })
                          }
                        />
                      </div>

                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="smtpEnableSsl"
                          checked={!!setupSettings.smtpSettings?.smtpEnableSsl}
                          onChange={(e) =>
                            onChangeSmtp({
                              smtpEnableSsl: e.target.checked,
                            })
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="smtpEnableSsl"
                        >
                          Use SSL
                        </label>
                      </div>

                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="smtpUseAuthentication"
                          checked={
                            !!setupSettings.smtpSettings?.smtpUseAuthentication
                          }
                          onChange={(e) =>
                            onChangeSmtp({
                              smtpUseAuthentication: e.target.checked,
                            })
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor="smtpUseAuthentication"
                        >
                          Use Default Credentials
                        </label>
                      </div>

                      <div className="mb-5">
                        <label className="form-label">SMTP Domain</label>
                        <input
                          type="text"
                          className="form-control"
                          value={setupSettings.smtpSettings?.smtpDomain || ""}
                          onChange={(e) =>
                            onChangeSmtp({ smtpDomain: e.target.value })
                          }
                        />
                      </div>

                      <div className="mb-5">
                        <label className="form-label">SMTP Username</label>
                        <input
                          type="text"
                          className="form-control"
                          value={setupSettings.smtpSettings?.smtpUserName || ""}
                          onChange={(e) =>
                            onChangeSmtp({
                              smtpUserName: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="mb-5">
                        <label className="form-label">SMTP Password</label>
                        <input
                          type="password"
                          className="form-control"
                          value={setupSettings.smtpSettings?.smtpPassword || ""}
                          onChange={(e) =>
                            onChangeSmtp({
                              smtpPassword: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="separator my-4"></div>

                      <div className="mb-5">
                        <label className="form-label">Legal Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={setupSettings.billInfo?.legalName || ""}
                          onChange={(e) =>
                            onChangeBill({ legalName: e.target.value })
                          }
                        />
                      </div>

                      <div className="mb-5">
                        <label className="form-label">Address</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={setupSettings.billInfo?.address || ""}
                          onChange={(e) =>
                            onChangeBill({ address: e.target.value })
                          }
                        />
                      </div>

                      <div className="d-flex justify-content-end">
                        <button
                          id="SaveButton"
                          className="btn btn-primary"
                          onClick={(e) => {
                            e.preventDefault();
                            saveAll();
                          }}
                          disabled={saving}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPage;
