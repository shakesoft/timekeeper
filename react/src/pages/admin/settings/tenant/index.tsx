import React, { useCallback, useEffect, useState } from "react";
import { Tabs, Spin, App } from "antd";
import { useForm } from "react-hook-form";
import {
  TenantSettingsServiceProxy,
  TenantSettingsEditDto,
  SendTestEmailInput,
  JsonClaimMapDto,
} from "@api/generated/service-proxies";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../../../hooks/useAuth";
import {
  GeneralSettingsTab,
  AppearanceSettingsTab,
  UserManagementTab,
  SecuritySettingsTab,
  EmailSettingsTab,
  InvoiceSettingsTab,
  OtherSettingsTab,
  ExternalLoginSettingsTab,
} from "./components";
import { useServiceProxy } from "@/api/service-proxy-factory";
import { useSession } from "@/hooks/useSession";
import L from "@/lib/L";
import "./styles.css";
import { useTheme } from "@/hooks/useTheme";

const TenantSettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { application } = useSession();
  const tenantSettingsService = useServiceProxy(TenantSettingsServiceProxy, []);
  const { modal } = App.useApp();
  const { containerClass } = useTheme();
  const { control, handleSubmit, reset, watch, getValues, setValue } =
    useForm<TenantSettingsEditDto>({
      defaultValues: new TenantSettingsEditDto(),
    });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState<string>("");
  const [initialEmailSnapshot, setInitialEmailSnapshot] = useState<string>("");
  const [hasEnabledSocialLogins, setHasEnabledSocialLogins] = useState(false);

  const showTimezoneSelection = abp.clock.provider.supportsMultipleTimezone;
  const isMultiTenancyEnabled = abp.multiTenancy.isEnabled;
  const allowTenantsToChangeEmailSettings =
    application?.allowTenantsToChangeEmailSettings ?? false;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const settings = await tenantSettingsService.getAllSettings();
      reset(settings);
      setInitialEmailSnapshot(JSON.stringify(settings.email));
      setTestEmail(currentUser?.email ?? "");

      try {
        const enabledSocialLogins =
          await tenantSettingsService.getEnabledSocialLoginSettings();
        setHasEnabledSocialLogins(
          (enabledSocialLogins?.enabledSocialLoginSettings ?? []).length > 0,
        );
      } catch {
        setHasEnabledSocialLogins(false);
      }
    } finally {
      setLoading(false);
    }
  }, [tenantSettingsService, reset, currentUser]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = async (values: TenantSettingsEditDto) => {
    setSaving(true);
    try {
      await tenantSettingsService.updateAllSettings(values);
      setInitialEmailSnapshot(JSON.stringify(values.email));
      abp.notify.success(L("SavedSuccessfully"));
    } finally {
      setSaving(false);
    }
  };

  const saveAll = () => handleSubmit(onSave)();

  const sendTestEmail = async () => {
    const current = getValues();
    const proceed =
      initialEmailSnapshot === JSON.stringify(current.email)
        ? true
        : await new Promise<boolean>((resolve) => {
            modal.confirm({
              title: L("AreYouSure"),
              content: L("SendEmailWithSavedSettingsWarning"),
              onOk: () => resolve(true),
              onCancel: () => resolve(false),
            });
          });
    if (!proceed) return;
    const input = new SendTestEmailInput();
    input.emailAddress = testEmail;
    await tenantSettingsService.sendTestEmail(input);
  };

  const handleClaimsChange = (
    provider: "wsFed" | "oidc",
    items: { key: string; value: string }[],
  ) => {
    const v = getValues();
    if (provider === "wsFed") {
      v.externalLoginProviderSettings.wsFederationClaimsMapping = (
        items ?? []
      ).map((i) => new JsonClaimMapDto({ key: i.key, claim: i.value }));
    } else {
      v.externalLoginProviderSettings.openIdConnectClaimsMapping = (
        items ?? []
      ).map((i) => new JsonClaimMapDto({ key: i.key, claim: i.value }));
    }
    reset(v);
  };

  const items = [
    ...(showTimezoneSelection
      ? [
          {
            key: "general",
            label: L("General"),
            children: <GeneralSettingsTab control={control} />,
          },
        ]
      : []),
    {
      key: "appearance",
      label: L("Appearance"),
      children: <AppearanceSettingsTab />,
    },
    {
      key: "user",
      label: L("UserManagement"),
      children: <UserManagementTab control={control} watch={watch} />,
    },
    {
      key: "security",
      label: L("Security"),
      children: <SecuritySettingsTab control={control} watch={watch} />,
    },
    ...(!isMultiTenancyEnabled || allowTenantsToChangeEmailSettings
      ? [
          {
            key: "email",
            label: L("EmailSmtp"),
            children: (
              <EmailSettingsTab
                control={control}
                watch={watch}
                testEmail={testEmail}
                setTestEmail={setTestEmail}
                onSendTestEmail={sendTestEmail}
              />
            ),
          },
        ]
      : []),
    {
      key: "invoice",
      label: L("Invoice"),
      children: <InvoiceSettingsTab control={control} />,
    },
    ...(!isMultiTenancyEnabled
      ? [
          {
            key: "other",
            label: L("OtherSettings"),
            children: <OtherSettingsTab control={control} />,
          },
        ]
      : []),
    ...(hasEnabledSocialLogins
      ? [
          {
            key: "external",
            label: L("ExternalLoginSettings"),
            children: (
              <ExternalLoginSettingsTab
                control={control}
                values={getValues()}
                setValue={setValue}
                onClaimsChange={handleClaimsChange}
              />
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader title={L("Settings")} />
      <div className={containerClass}>
        <div className="card">
          <div className="card-body">
            <Spin spinning={loading}>
              <Tabs items={items} />
            </Spin>
          </div>
          <div className="card-footer">
            <button
              className="btn btn-primary ms-5"
              disabled={saving}
              onClick={saveAll}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  {L("SavingWithThreeDot")}
                </>
              ) : (
                <>
                  <i className="la la-floppy-o"></i>
                  {L("SaveAll")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TenantSettingsPage;
