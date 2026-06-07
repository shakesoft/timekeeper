import React, { useState, useEffect, useCallback } from "react";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { Controller, type Control, type UseFormSetValue } from "react-hook-form";
import {
  HostSettingsEditDto,
  HostSettingsServiceProxy,
  ExternalLoginSettingsDto,
  JsonClaimMapDto,
} from "@api/generated/service-proxies";
import KeyValueListManager, { type KeyValueItem } from "./KeyValueListManager";
import PasswordInputWithShowButton from "@/pages/admin/components/common/PasswordInputWithShowButton";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

interface Props {
  control: Control<HostSettingsEditDto>;
  values: HostSettingsEditDto;
  setValue: UseFormSetValue<HostSettingsEditDto>;
  onClaimsChange: (provider: "wsFed" | "oidc", items: KeyValueItem[]) => void;
}

const ExternalLoginSettingsTab: React.FC<Props> = ({
  control,
  values,
  setValue,
  onClaimsChange,
}) => {
  const hostSettingsService = useServiceProxy(HostSettingsServiceProxy, []);
  const [enabled, setEnabled] = useState<string[]>([]);

  useEffect(() => {
    hostSettingsService
      .getEnabledSocialLoginSettings()
      .then((r: ExternalLoginSettingsDto) => {
        setEnabled(r.enabledSocialLoginSettings ?? []);
      });
  }, [hostSettingsService]);

  const isEnabled = useCallback(
    (name: string) => enabled.includes(name),
    [enabled],
  );

  const oidcResponseTypes = (
    values?.externalLoginProviderSettings?.openIdConnect?.responseType || ""
  )
    .split(",")
    .filter(Boolean);
  const [oidcCode, setOidcCode] = useState(oidcResponseTypes.includes("code"));
  const [oidcToken, setOidcToken] = useState(
    oidcResponseTypes.includes("token"),
  );
  const [oidcIdToken, setOidcIdToken] = useState(
    oidcResponseTypes.includes("id_token"),
  );

  useEffect(() => {
    const parts: string[] = [];
    if (oidcToken) parts.push("token");
    if (oidcIdToken) parts.push("id_token");
    if (oidcCode) parts.push("code");
    setValue(
      "externalLoginProviderSettings.openIdConnect.responseType",
      parts.join(","),
    );
  }, [oidcCode, oidcIdToken, oidcToken, setValue]);

  const wsClaimItems: KeyValueItem[] = (
    values.externalLoginProviderSettings.wsFederationClaimsMapping ?? []
  ).map((m: JsonClaimMapDto) => ({ key: m.key ?? "", value: m.claim ?? "" }));
  const oidcClaimItems: KeyValueItem[] = (
    values.externalLoginProviderSettings.openIdConnectClaimsMapping ?? []
  ).map((m: JsonClaimMapDto) => ({ key: m.key ?? "", value: m.claim ?? "" }));

  const tabs: TabsProps["items"] = [];
  if (isEnabled("Facebook")) {
    tabs.push({
      key: "facebook",
      label: "Facebook",
      children: (
        <div className="p-5">
          <div className="mb-5">
            <label className="form-label">{L("AppId")}</label>
            <Controller
              name="externalLoginProviderSettings.facebook.appId"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div className="mb-5">
            <label className="form-label">{L("AppSecret")}</label>
            <Controller
              name="externalLoginProviderSettings.facebook.appSecret"
              control={control}
              render={({ field }) => (
                <PasswordInputWithShowButton
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
        </div>
      ),
    });
  }
  if (isEnabled("Google")) {
    tabs.push({
      key: "google",
      label: "Google",
      children: (
        <div className="p-5">
          <div className="mb-5">
            <label className="form-label">{L("ClientId")}</label>
            <Controller
              name="externalLoginProviderSettings.google.clientId"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div className="mb-5">
            <label className="form-label">{L("ClientSecret")}</label>
            <Controller
              name="externalLoginProviderSettings.google.clientSecret"
              control={control}
              render={({ field }) => (
                <PasswordInputWithShowButton
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div className="mb-5">
            <label className="form-label">{L("UserInfoEndpoint")}</label>
            <Controller
              name="externalLoginProviderSettings.google.userInfoEndpoint"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
        </div>
      ),
    });
  }
  if (isEnabled("Microsoft")) {
    tabs.push({
      key: "microsoft",
      label: "Microsoft",
      children: (
        <div className="p-5">
          <div className="mb-5">
            <label className="form-label">{L("ClientId")}</label>
            <Controller
              name="externalLoginProviderSettings.microsoft.clientId"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div className="mb-5">
            <label className="form-label">{L("ClientSecret")}</label>
            <Controller
              name="externalLoginProviderSettings.microsoft.clientSecret"
              control={control}
              render={({ field }) => (
                <PasswordInputWithShowButton
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
        </div>
      ),
    });
  }
  if (isEnabled("WsFederation")) {
    tabs.push({
      key: "wsfed",
      label: "WsFederation",
      children: (
        <div className="p-5">
          <div className="mb-5">
            <label className="form-label">{L("ClientId")}</label>
            <Controller
              name="externalLoginProviderSettings.wsFederation.clientId"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div className="mb-5">
            <label className="form-label">{L("Tenant")}</label>
            <Controller
              name="externalLoginProviderSettings.wsFederation.tenant"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div className="mb-5">
            <label className="form-label">{L("MetaDataAddress")}</label>
            <Controller
              name="externalLoginProviderSettings.wsFederation.metaDataAddress"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div className="mb-5">
            <label className="form-label">{L("Wtrealm")}</label>
            <Controller
              name="externalLoginProviderSettings.wsFederation.wtrealm"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div className="mb-5">
            <label className="form-label">{L("Authority")}</label>
            <Controller
              name="externalLoginProviderSettings.wsFederation.authority"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <KeyValueListManager
            header={L("ClaimsMapping")}
            keyPlaceHolder={L("ClaimKey")}
            valuePlaceHolder={L("ClaimValue")}
            items={wsClaimItems}
            onChange={(items) => onClaimsChange("wsFed", items)}
          />
        </div>
      ),
    });
  }
  if (isEnabled("OpenId")) {
    tabs.push({
      key: "oidc",
      label: "OpenId",
      children: (
        <div className="p-5">
          <div className="mb-5">
            <label className="form-label">{L("ClientId")}</label>
            <Controller
              name="externalLoginProviderSettings.openIdConnect.clientId"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div className="mb-5">
            <label className="form-label">{L("ClientSecret")}</label>
            <Controller
              name="externalLoginProviderSettings.openIdConnect.clientSecret"
              control={control}
              render={({ field }) => (
                <PasswordInputWithShowButton
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div className="mb-5">
            <label className="form-label">{L("Authority")}</label>
            <Controller
              name="externalLoginProviderSettings.openIdConnect.authority"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div className="mb-5">
            <label className="form-label">{L("LoginUrl")}</label>
            <Controller
              name="externalLoginProviderSettings.openIdConnect.loginUrl"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div className="mb-5">
            <Controller
              name="externalLoginProviderSettings.openIdConnect.validateIssuer"
              control={control}
              render={({ field }) => (
                <div className="form-check form-check-custom form-check-solid">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={field.value}
                    onChange={field.onChange}
                    id="validateIssuer"
                  />
                  <label className="form-check-label" htmlFor="validateIssuer">
                    {L("ValidateIssuer")}
                  </label>
                </div>
              )}
            />
          </div>
          <div className="mb-5">
            <div className="mb-2 fw-bold">{L("ResponseType")}</div>
            <div className="d-flex gap-3">
              <div className="form-check form-check-custom form-check-solid">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={oidcCode}
                  onChange={(e) => setOidcCode(e.target.checked)}
                  id="oidcCode"
                />
                <label className="form-check-label" htmlFor="oidcCode">
                  code
                </label>
              </div>
              <div className="form-check form-check-custom form-check-solid">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={oidcToken}
                  onChange={(e) => setOidcToken(e.target.checked)}
                  id="oidcToken"
                />
                <label className="form-check-label" htmlFor="oidcToken">
                  token
                </label>
              </div>
              <div className="form-check form-check-custom form-check-solid">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={oidcIdToken}
                  onChange={(e) => setOidcIdToken(e.target.checked)}
                  id="oidcIdToken"
                />
                <label className="form-check-label" htmlFor="oidcIdToken">
                  id_token
                </label>
              </div>
            </div>
          </div>
          <KeyValueListManager
            header={L("ClaimsMapping")}
            keyPlaceHolder={L("ClaimKey")}
            valuePlaceHolder={L("ClaimValue")}
            items={oidcClaimItems}
            onChange={(items) => onClaimsChange("oidc", items)}
          />
        </div>
      ),
    });
  }
  if (isEnabled("Twitter")) {
    tabs.push({
      key: "twitter",
      label: "Twitter",
      children: (
        <div className="p-5">
          <div className="mb-5">
            <label className="form-label">{L("ConsumerKey")}</label>
            <Controller
              name="externalLoginProviderSettings.twitter.consumerKey"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  className="form-control"
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div className="mb-5">
            <label className="form-label">{L("ConsumerSecret")}</label>
            <Controller
              name="externalLoginProviderSettings.twitter.consumerSecret"
              control={control}
              render={({ field }) => (
                <PasswordInputWithShowButton
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
        </div>
      ),
    });
  }

  if (!enabled?.length) return null;

  return <Tabs tabPosition="left" items={tabs} />;
};

export default ExternalLoginSettingsTab;
