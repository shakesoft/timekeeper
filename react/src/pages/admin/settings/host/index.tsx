import React, { useCallback, useEffect, useState } from "react";
import { Tabs, Spin, App } from "antd";
import { useForm } from "react-hook-form";
import {
  HostSettingsServiceProxy,
  CommonLookupServiceProxy,
  HostSettingsEditDto,
  SubscribableEditionComboboxItemDto,
  SendTestEmailInput,
  JsonClaimMapDto,
} from "@api/generated/service-proxies";
import GeneralSettingsTab from "./components/GeneralSettingsTab";
import TenantManagementTab from "./components/TenantManagementTab";
import UserManagementTab from "./components/UserManagementTab";
import SecuritySettingsTab from "./components/SecuritySettingsTab";
import EmailSettingsTab from "./components/EmailSettingsTab";
import InvoiceSettingsTab from "./components/InvoiceSettingsTab";
import OtherSettingsTab from "./components/OtherSettingsTab";
import ExternalLoginSettingsTab from "./components/ExternalLoginSettingsTab";
import PageHeader from "../../components/common/PageHeader";
import { useAuth } from "../../../../hooks/useAuth";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useTheme } from "@/hooks/useTheme";

const HostSettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const hostService = useServiceProxy(HostSettingsServiceProxy, []);
  const lookupService = useServiceProxy(CommonLookupServiceProxy, []);
  const { modal } = App.useApp();
  const { containerClass } = useTheme();
  const { control, handleSubmit, reset, watch, getValues, setValue } =
    useForm<HostSettingsEditDto>({
      defaultValues: new HostSettingsEditDto(),
    });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editions, setEditions] = useState<
    SubscribableEditionComboboxItemDto[]
  >([]);
  const [testEmail, setTestEmail] = useState<string>("");
  const [initialEmailSnapshot, setInitialEmailSnapshot] = useState<string>("");
  const [enabledSocialLoginSettings, setEnabledSocialLoginSettings] = useState<
    string[]
  >([]);
  const showTimezoneSelection = abp.clock.provider.supportsMultipleTimezone;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const settings = await hostService.getAllSettings();
      reset(settings);
      setInitialEmailSnapshot(JSON.stringify(settings.email));
      setTestEmail(currentUser?.email ?? "");
      const editionsResult = await lookupService.getEditionsForCombobox(false);
      const items = editionsResult.items ?? [];
      const notAssigned = new SubscribableEditionComboboxItemDto();
      notAssigned.value = "";
      notAssigned.displayText = L("NotAssigned");
      setEditions([notAssigned, ...items]);

      const socialLoginSettings =
        await hostService.getEnabledSocialLoginSettings();
      setEnabledSocialLoginSettings(
        socialLoginSettings.enabledSocialLoginSettings ?? [],
      );
    } finally {
      setLoading(false);
    }
  }, [hostService, lookupService, reset, currentUser]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = async (values: HostSettingsEditDto) => {
    setSaving(true);
    try {
      if (
        !values.tenantManagement.defaultEditionId ||
        String(values.tenantManagement.defaultEditionId) === "null"
      ) {
        values.tenantManagement.defaultEditionId = undefined;
      }
      await hostService.updateAllSettings(values);
      setInitialEmailSnapshot(JSON.stringify(values.email));
      abp.notify.success(L("SavedSuccessfully"));

      window.location.reload();
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
    await hostService.sendTestEmail(input);
    abp.notify.success(L("TestEmailSentSuccessfully"));
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
      key: "tenant",
      label: L("TenantManagement"),
      children: (
        <TenantManagementTab
          control={control}
          editions={editions}
          watch={watch}
        />
      ),
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
    {
      key: "invoice",
      label: L("Invoice"),
      children: <InvoiceSettingsTab control={control} />,
    },
    {
      key: "other",
      label: L("OtherSettings"),
      children: <OtherSettingsTab control={control} />,
    },
    ...(enabledSocialLoginSettings && enabledSocialLoginSettings.length > 0
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
        <div className="card card-custom gutter-b">
          <div className="card-body">
            <Spin spinning={loading}>
              <Tabs items={items} />
            </Spin>
          </div>
          <div className="card-footer text-start">
            <button
              type="button"
              className="btn btn-primary d-inline-flex align-items-center"
              disabled={saving}
              onClick={saveAll}
            >
              {saving && (
                <span className="spinner-border spinner-border-sm me-2"></span>
              )}
              <i className="fa fa-save me-2 align-middle"></i>
              <span className="align-middle">{L("SaveAll")}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HostSettingsPage;
