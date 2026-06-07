import React, { useState, useEffect, useCallback } from "react";
import { Controller, type Control, type UseFormSetValue } from "react-hook-form";
import { Tabs } from "antd";
import {
  TenantSettingsEditDto,
  TenantSettingsServiceProxy,
  ExternalLoginSettingsDto,
  JsonClaimMapDto,
} from "@api/generated/service-proxies";
import KeyValueListManager, {
  type KeyValueItem,
} from "../../host/components/KeyValueListManager";
import PasswordInputWithShowButton from "@/pages/admin/components/common/PasswordInputWithShowButton";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

interface Props {
  control: Control<TenantSettingsEditDto>;
  values: TenantSettingsEditDto;
  setValue: UseFormSetValue<TenantSettingsEditDto>;
  onClaimsChange: (provider: "wsFed" | "oidc", items: KeyValueItem[]) => void;
}

const ExternalLoginSettingsTab: React.FC<Props> = ({
  control,
  values,
  setValue,
  onClaimsChange,
}) => {
  const tenantSettingsService = useServiceProxy(TenantSettingsServiceProxy, []);
  const [enabled, setEnabled] = useState<string[]>([]);

  const [useFacebookHostSettings, setUseFacebookHostSettings] = useState(
    !values?.externalLoginProviderSettings?.facebook?.appId &&
      !values?.externalLoginProviderSettings?.facebook_IsDeactivated,
  );
  const [useGoogleHostSettings, setUseGoogleHostSettings] = useState(
    !values?.externalLoginProviderSettings?.google?.clientId &&
      !values?.externalLoginProviderSettings?.google_IsDeactivated,
  );
  const [useMicrosoftHostSettings, setUseMicrosoftHostSettings] = useState(
    !values?.externalLoginProviderSettings?.microsoft?.clientId &&
      !values?.externalLoginProviderSettings?.microsoft_IsDeactivated,
  );
  const [useWsFederationHostSettings, setUseWsFederationHostSettings] =
    useState(
      !values?.externalLoginProviderSettings?.wsFederation?.clientId &&
        !values?.externalLoginProviderSettings?.wsFederation_IsDeactivated,
    );
  const [useOpenIdHostSettings, setUseOpenIdHostSettings] = useState(
    !values?.externalLoginProviderSettings?.openIdConnect?.clientId &&
      !values?.externalLoginProviderSettings?.openIdConnect_IsDeactivated,
  );
  const [useTwitterHostSettings, setUseTwitterHostSettings] = useState(
    !values?.externalLoginProviderSettings?.twitter?.consumerKey &&
      !values?.externalLoginProviderSettings?.twitter_IsDeactivated,
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
    tenantSettingsService
      .getEnabledSocialLoginSettings()
      .then((r: ExternalLoginSettingsDto) => {
        setEnabled(r.enabledSocialLoginSettings ?? []);
      })
      .catch(() => {
        setEnabled([]);
      });
  }, [tenantSettingsService]);

  const isEnabled = useCallback(
    (name: string) => enabled.includes(name),
    [enabled],
  );

  const clearFacebookSettings = () => {
    if (values?.externalLoginProviderSettings?.facebook) {
      setValue("externalLoginProviderSettings.facebook.appId", "");
      setValue("externalLoginProviderSettings.facebook.appSecret", "");
      setValue("externalLoginProviderSettings.facebook_IsDeactivated", false);
    }
  };

  const clearGoogleSettings = () => {
    if (values?.externalLoginProviderSettings?.google) {
      setValue("externalLoginProviderSettings.google.clientId", "");
      setValue("externalLoginProviderSettings.google.clientSecret", "");
      setValue("externalLoginProviderSettings.google.userInfoEndpoint", "");
      setValue("externalLoginProviderSettings.google_IsDeactivated", false);
    }
  };

  const clearMicrosoftSettings = () => {
    if (values?.externalLoginProviderSettings?.microsoft) {
      setValue("externalLoginProviderSettings.microsoft.clientId", "");
      setValue("externalLoginProviderSettings.microsoft.clientSecret", "");
      setValue("externalLoginProviderSettings.microsoft_IsDeactivated", false);
    }
  };

  const clearWsFederationSettings = () => {
    if (values?.externalLoginProviderSettings?.wsFederation) {
      setValue("externalLoginProviderSettings.wsFederation.clientId", "");
      setValue("externalLoginProviderSettings.wsFederation.authority", "");
      setValue("externalLoginProviderSettings.wsFederation.wtrealm", "");
      setValue("externalLoginProviderSettings.wsFederation.metaDataAddress", "");
      setValue("externalLoginProviderSettings.wsFederation.tenant", "");
      setValue("externalLoginProviderSettings.wsFederationClaimsMapping", []);
      setValue("externalLoginProviderSettings.wsFederation_IsDeactivated", false);
    }
  };

  const clearOpenIdSettings = () => {
    if (values?.externalLoginProviderSettings?.openIdConnect) {
      setValue("externalLoginProviderSettings.openIdConnect.clientId", "");
      setValue("externalLoginProviderSettings.openIdConnect.clientSecret", "");
      setValue("externalLoginProviderSettings.openIdConnect.authority", "");
      setValue("externalLoginProviderSettings.openIdConnect.loginUrl", "");
      setValue("externalLoginProviderSettings.openIdConnectClaimsMapping", []);
      setValue("externalLoginProviderSettings.openIdConnect_IsDeactivated", false);
    }
  };

  const clearTwitterSettings = () => {
    if (values?.externalLoginProviderSettings?.twitter) {
      setValue("externalLoginProviderSettings.twitter.consumerKey", "");
      setValue("externalLoginProviderSettings.twitter.consumerSecret", "");
      setValue("externalLoginProviderSettings.twitter_IsDeactivated", false);
    }
  };

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

  const tabItems: Array<{
    key: string;
    label: string;
    children: React.ReactNode;
  }> = [];

  if (isEnabled("Facebook")) {
    tabItems.push({
      key: "facebook",
      label: "Facebook",
      children: (
        <div className="p-5">
          <div className="form-check form-check-custom form-check-solid py-1">
            <input
              type="checkbox"
              className="form-check-input"
              id="Settings_Facebook_UseHostSettings"
              checked={useFacebookHostSettings}
              onChange={(e) => {
                setUseFacebookHostSettings(e.target.checked);
                if (e.target.checked) {
                  clearFacebookSettings();
                }
              }}
            />
            <label
              className="form-check-label"
              htmlFor="Settings_Facebook_UseHostSettings"
            >
              {L("UseHostSettings")}
            </label>
          </div>
          {!useFacebookHostSettings && (
            <div className="mt-3">
              <div className="form-check form-check-custom form-check-solid py-1">
                <Controller
                  name="externalLoginProviderSettings.facebook_IsDeactivated"
                  control={control}
                  render={({ field }) => (
                    <>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="Settings_Facebook_IsDeactivated"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="Settings_Facebook_IsDeactivated"
                      >
                        {L("Deactivate")}
                      </label>
                    </>
                  )}
                />
              </div>
              <span className="form-text text-muted">
                {L("SocialLoginDeactivate_Description")}
              </span>
              <div className="mb-5 mt-3">
                <label className="form-label" htmlFor="Setting_Facebook_AppId">
                  {L("AppId")}*
                </label>
                <Controller
                  name="externalLoginProviderSettings.facebook.appId"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      id="Setting_Facebook_AppId"
                      className="form-control"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="mb-5">
                <label className="form-label required">{L("AppSecret")}</label>
                <Controller
                  name="externalLoginProviderSettings.facebook.appSecret"
                  control={control}
                  render={({ field }) => (
                    <PasswordInputWithShowButton
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </div>
            </div>
          )}
        </div>
      ),
    });
  }

  if (isEnabled("Google")) {
    tabItems.push({
      key: "google",
      label: "Google",
      children: (
        <div className="p-5">
          <div className="form-check form-check-custom form-check-solid py-1">
            <input
              type="checkbox"
              className="form-check-input"
              id="Settings_Google_UseHostSettings"
              checked={useGoogleHostSettings}
              onChange={(e) => {
                setUseGoogleHostSettings(e.target.checked);
                if (e.target.checked) {
                  clearGoogleSettings();
                }
              }}
            />
            <label
              className="form-check-label"
              htmlFor="Settings_Google_UseHostSettings"
            >
              {L("UseHostSettings")}
            </label>
          </div>
          {!useGoogleHostSettings && (
            <div className="mt-3">
              <div className="form-check form-check-custom form-check-solid py-1">
                <Controller
                  name="externalLoginProviderSettings.google_IsDeactivated"
                  control={control}
                  render={({ field }) => (
                    <>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="Settings_Google_IsDeactivated"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="Settings_Google_IsDeactivated"
                      >
                        {L("Deactivate")}
                      </label>
                    </>
                  )}
                />
              </div>
              <span className="form-text text-muted">
                {L("SocialLoginDeactivate_Description")}
              </span>
              <div className="mb-5 mt-3">
                <label className="form-label" htmlFor="Setting_Google_ClientId">
                  {L("ClientId")}*
                </label>
                <Controller
                  name="externalLoginProviderSettings.google.clientId"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      id="Setting_Google_ClientId"
                      className="form-control"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="mb-5">
                <label className="form-label required">
                  {L("ClientSecret")}
                </label>
                <Controller
                  name="externalLoginProviderSettings.google.clientSecret"
                  control={control}
                  render={({ field }) => (
                    <PasswordInputWithShowButton
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </div>
              <div className="mb-5">
                <label
                  className="form-label"
                  htmlFor="Setting_Google_UserInfoEndpoint"
                >
                  {L("UserInfoEndpoint")} *
                </label>
                <Controller
                  name="externalLoginProviderSettings.google.userInfoEndpoint"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      id="Setting_Google_UserInfoEndpoint"
                      className="form-control"
                      {...field}
                    />
                  )}
                />
              </div>
            </div>
          )}
        </div>
      ),
    });
  }

  if (isEnabled("Microsoft")) {
    tabItems.push({
      key: "microsoft",
      label: "Microsoft",
      children: (
        <div className="p-5">
          <div className="form-check form-check-custom form-check-solid py-1">
            <input
              type="checkbox"
              className="form-check-input"
              id="Settings_Microsoft_UseHostSettings"
              checked={useMicrosoftHostSettings}
              onChange={(e) => {
                setUseMicrosoftHostSettings(e.target.checked);
                if (e.target.checked) {
                  clearMicrosoftSettings();
                }
              }}
            />
            <label
              className="form-check-label"
              htmlFor="Settings_Microsoft_UseHostSettings"
            >
              {L("UseHostSettings")}
            </label>
          </div>
          {!useMicrosoftHostSettings && (
            <div className="mt-3">
              <div className="form-check form-check-custom form-check-solid py-1">
                <Controller
                  name="externalLoginProviderSettings.microsoft_IsDeactivated"
                  control={control}
                  render={({ field }) => (
                    <>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="Settings_Microsoft_IsDeactivated"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="Settings_Microsoft_IsDeactivated"
                      >
                        {L("Deactivate")}
                      </label>
                    </>
                  )}
                />
              </div>
              <span className="form-text text-muted">
                {L("SocialLoginDeactivate_Description")}
              </span>
              <div className="mb-5 mt-3">
                <label
                  className="form-label"
                  htmlFor="Setting_Microsoft_ClientId"
                >
                  {L("ClientId")}*
                </label>
                <Controller
                  name="externalLoginProviderSettings.microsoft.clientId"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      id="Setting_Microsoft_ClientId"
                      className="form-control"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="mb-5">
                <label className="form-label required">
                  {L("ClientSecret")}
                </label>
                <Controller
                  name="externalLoginProviderSettings.microsoft.clientSecret"
                  control={control}
                  render={({ field }) => (
                    <PasswordInputWithShowButton
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </div>
            </div>
          )}
        </div>
      ),
    });
  }

  if (isEnabled("WsFederation")) {
    tabItems.push({
      key: "wsfed",
      label: "WsFederation",
      children: (
        <div className="p-5">
          <div className="form-check form-check-custom form-check-solid py-1">
            <input
              type="checkbox"
              className="form-check-input"
              id="Settings_WsFederation_UseHostSettings"
              checked={useWsFederationHostSettings}
              onChange={(e) => {
                setUseWsFederationHostSettings(e.target.checked);
                if (e.target.checked) {
                  clearWsFederationSettings();
                }
              }}
            />
            <label
              className="form-check-label"
              htmlFor="Settings_WsFederation_UseHostSettings"
            >
              {L("UseHostSettings")}
            </label>
          </div>
          {!useWsFederationHostSettings && (
            <div className="mt-3">
              <div className="form-check form-check-custom form-check-solid py-1">
                <Controller
                  name="externalLoginProviderSettings.wsFederation_IsDeactivated"
                  control={control}
                  render={({ field }) => (
                    <>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="Settings_WsFederation_IsDeactivated"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="Settings_WsFederation_IsDeactivated"
                      >
                        {L("Deactivate")}
                      </label>
                    </>
                  )}
                />
              </div>
              <span className="form-text text-muted">
                {L("SocialLoginDeactivate_Description")}
              </span>
              <div className="mb-5 mt-3">
                <label
                  className="form-label"
                  htmlFor="Setting_WsFederation_ClientId"
                >
                  {L("ClientId")}
                </label>
                <Controller
                  name="externalLoginProviderSettings.wsFederation.clientId"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      id="Setting_WsFederation_ClientId"
                      className="form-control"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="mb-5">
                <label
                  className="form-label"
                  htmlFor="Setting_WsFederation_Tenant"
                >
                  {L("Tenant")}
                </label>
                <Controller
                  name="externalLoginProviderSettings.wsFederation.tenant"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      id="Setting_WsFederation_Tenant"
                      className="form-control"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="mb-5">
                <label
                  className="form-label"
                  htmlFor="Setting_WsFederation_MetaDataAddress"
                >
                  {L("MetaDataAddress")}
                </label>
                <Controller
                  name="externalLoginProviderSettings.wsFederation.metaDataAddress"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      id="Setting_WsFederation_MetaDataAddress"
                      className="form-control"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="mb-5">
                <label
                  className="form-label"
                  htmlFor="Setting_WsFederation_Wtrealm"
                >
                  {L("Wtrealm")}
                </label>
                <Controller
                  name="externalLoginProviderSettings.wsFederation.wtrealm"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      id="Setting_WsFederation_Wtrealm"
                      className="form-control"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="mb-5">
                <label
                  className="form-label"
                  htmlFor="Setting_WsFederation_Authority"
                >
                  {L("Authority")}
                </label>
                <Controller
                  name="externalLoginProviderSettings.wsFederation.authority"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      id="Setting_WsFederation_Authority"
                      className="form-control"
                      {...field}
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
          )}
        </div>
      ),
    });
  }

  if (isEnabled("OpenId")) {
    tabItems.push({
      key: "oidc",
      label: "OpenId",
      children: (
        <div className="p-5">
          <div className="form-check form-check-custom form-check-solid py-1">
            <input
              type="checkbox"
              className="form-check-input"
              id="Settings_OpenIdConnect_UseHostSettings"
              checked={useOpenIdHostSettings}
              onChange={(e) => {
                setUseOpenIdHostSettings(e.target.checked);
                if (e.target.checked) {
                  clearOpenIdSettings();
                }
              }}
            />
            <label
              className="form-check-label"
              htmlFor="Settings_OpenIdConnect_UseHostSettings"
            >
              {L("UseHostSettings")}
            </label>
          </div>
          {!useOpenIdHostSettings && (
            <div className="mt-3">
              <div className="form-check form-check-custom form-check-solid py-1">
                <Controller
                  name="externalLoginProviderSettings.openIdConnect_IsDeactivated"
                  control={control}
                  render={({ field }) => (
                    <>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="Settings_OpenIdConnect_IsDeactivated"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="Settings_OpenIdConnect_IsDeactivated"
                      >
                        {L("Deactivate")}
                      </label>
                    </>
                  )}
                />
              </div>
              <span className="form-text text-muted">
                {L("SocialLoginDeactivate_Description")}
              </span>
              <div className="mb-5 mt-3">
                <label
                  className="form-label"
                  htmlFor="Setting_OpenIdConnect_ClientId"
                >
                  {L("ClientId")}
                </label>
                <Controller
                  name="externalLoginProviderSettings.openIdConnect.clientId"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      id="Setting_OpenIdConnect_ClientId"
                      className="form-control"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="mb-5">
                <label
                  className="form-label"
                  htmlFor="Setting_OpenIdConnect_ClientSecret"
                >
                  {L("ClientSecret")}
                </label>
                <Controller
                  name="externalLoginProviderSettings.openIdConnect.clientSecret"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      id="Setting_OpenIdConnect_ClientSecret"
                      className="form-control"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="mb-5">
                <label
                  className="form-label"
                  htmlFor="Setting_OpenIdConnect_Authority"
                >
                  {L("Authority")}
                </label>
                <Controller
                  name="externalLoginProviderSettings.openIdConnect.authority"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      id="Setting_OpenIdConnect_Authority"
                      className="form-control"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="mb-5">
                <label
                  className="form-label"
                  htmlFor="Setting_OpenIdConnect_LoginUrl"
                >
                  {L("LoginUrl")}
                </label>
                <Controller
                  name="externalLoginProviderSettings.openIdConnect.loginUrl"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      id="Setting_OpenIdConnect_LoginUrl"
                      className="form-control"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="form-check form-check-custom form-check-solid mb-3">
                <Controller
                  name="externalLoginProviderSettings.openIdConnect.validateIssuer"
                  control={control}
                  render={({ field }) => (
                    <>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="Setting_OpenIdConnect_ValidateIssuer"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="Setting_OpenIdConnect_ValidateIssuer"
                      >
                        {L("ValidateIssuer")}
                      </label>
                    </>
                  )}
                />
              </div>
              <div className="mb-5 mt-5">
                <label className="form-label">{L("ResponseType")}</label>
                <div className="d-flex gap-3">
                  <div className="form-check form-check-custom form-check-solid">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={oidcCode}
                      onChange={(e) => setOidcCode(e.target.checked)}
                      id="Setting_OpenIdConnect_ResponseType_Code"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="Setting_OpenIdConnect_ResponseType_Code"
                    >
                      code
                    </label>
                  </div>
                  <div className="form-check form-check-custom form-check-solid">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={oidcToken}
                      onChange={(e) => setOidcToken(e.target.checked)}
                      id="Setting_OpenIdConnect_ResponseType_Token"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="Setting_OpenIdConnect_ResponseType_Token"
                    >
                      token
                    </label>
                  </div>
                  <div className="form-check form-check-custom form-check-solid">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={oidcIdToken}
                      onChange={(e) => setOidcIdToken(e.target.checked)}
                      id="Setting_OpenIdConnect_ResponseType_IdToken"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="Setting_OpenIdConnect_ResponseType_IdToken"
                    >
                      id_token
                    </label>
                  </div>
                </div>
                <small>{L("ResponseType_Description")}</small>
              </div>
              <KeyValueListManager
                header={L("ClaimsMapping")}
                keyPlaceHolder={L("ClaimKey")}
                valuePlaceHolder={L("ClaimValue")}
                items={oidcClaimItems}
                onChange={(items) => onClaimsChange("oidc", items)}
              />
            </div>
          )}
        </div>
      ),
    });
  }

  if (isEnabled("Twitter")) {
    tabItems.push({
      key: "twitter",
      label: "Twitter",
      children: (
        <div className="p-5">
          <div className="form-check form-check-custom form-check-solid py-1">
            <input
              type="checkbox"
              className="form-check-input"
              id="Settings_Twitter_UseHostSettings"
              checked={useTwitterHostSettings}
              onChange={(e) => {
                setUseTwitterHostSettings(e.target.checked);
                if (e.target.checked) {
                  clearTwitterSettings();
                }
              }}
            />
            <label
              className="form-check-label"
              htmlFor="Settings_Twitter_UseHostSettings"
            >
              {L("UseHostSettings")}
            </label>
          </div>
          {!useTwitterHostSettings && (
            <div className="mt-3">
              <div className="form-check form-check-custom form-check-solid py-1">
                <Controller
                  name="externalLoginProviderSettings.twitter_IsDeactivated"
                  control={control}
                  render={({ field }) => (
                    <>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="Settings_Twitter_IsDeactivated"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="Settings_Twitter_IsDeactivated"
                      >
                        {L("Deactivate")}
                      </label>
                    </>
                  )}
                />
              </div>
              <span className="form-text text-muted">
                {L("SocialLoginDeactivate_Description")}
              </span>
              <div className="mb-5 mt-3">
                <label
                  className="form-label"
                  htmlFor="Setting_Twitter_ConsumerKey"
                >
                  {L("ConsumerKey")}*
                </label>
                <Controller
                  name="externalLoginProviderSettings.twitter.consumerKey"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      id="Setting_Twitter_ConsumerKey"
                      className="form-control"
                      {...field}
                    />
                  )}
                />
              </div>
              <div className="mb-5">
                <label className="form-label required">
                  {L("ConsumerSecret")}
                </label>
                <Controller
                  name="externalLoginProviderSettings.twitter.consumerSecret"
                  control={control}
                  render={({ field }) => (
                    <PasswordInputWithShowButton
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
              </div>
            </div>
          )}
        </div>
      ),
    });
  }

  if (!enabled?.length) return null;

  return <Tabs tabPosition="left" items={tabItems} />;
};

export default ExternalLoginSettingsTab;
