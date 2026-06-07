import React from "react";
import { Form } from "antd";
import { type Control, Controller, type UseFormWatch } from "react-hook-form";
import { TenantSettingsEditDto } from "@api/generated/service-proxies";
import L from "@/lib/L";

interface Props {
  control: Control<TenantSettingsEditDto>;
  watch: UseFormWatch<TenantSettingsEditDto>;
}

const UserManagementTab: React.FC<Props> = ({ control, watch }) => {
  const isMultiTenancyEnabled = abp.multiTenancy.isEnabled;
  const isSessionTimeOutEnabled = watch(
    "userManagement.sessionTimeOutSettings.isEnabled",
  );
  const restrictEmailEnabled = watch(
    "userManagement.isRestrictedEmailDomainEnabled",
  );
  const allowSelfRegistration = watch("userManagement.allowSelfRegistration");
  const isRestrictedEmailDomainEnabledForApplication = watch(
    "userManagement.isRestrictedEmailDomainEnabledForApplication",
  );
  const isEmailPasswordlessLoginEnabledForApplication = watch(
    "userManagement.passwordlessLogin.isEnabledForApplication",
  );
  const isEmailProviderEnabledForApplication = watch(
    "userManagement.passwordlessLogin.isEmailProviderEnabledForApplication",
  );
  const isSmsProviderEnabledForApplication = watch(
    "userManagement.passwordlessLogin.isSmsProviderEnabledForApplication",
  );
  const ldapIsModuleEnabled = watch("ldap.isModuleEnabled");
  const ldapIsEnabled = watch("ldap.isEnabled");
  const isQrLoginEnabledForApplication = watch(
    "userManagement.isQrLoginEnabledForApplication",
  );

  return (
    <Form layout="vertical">
      <h5 className="mb-3">{L("FormBasedRegistration")}</h5>
      <Form.Item className="mb-5">
        <Controller
          name="userManagement.allowSelfRegistration"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                checked={field.value}
                onChange={field.onChange}
                id="allowSelfRegistration"
              />
              <label
                className="form-check-label"
                htmlFor="allowSelfRegistration"
              >
                {L("AllowUsersToRegisterThemselves")}
              </label>
            </div>
          )}
        />
        <span className="form-text text-muted">
          {L("AllowUsersToRegisterThemselves_Hint")}
        </span>
      </Form.Item>
      {allowSelfRegistration && (
        <Form.Item>
          <Controller
            name="userManagement.isNewRegisteredUserActiveByDefault"
            control={control}
            render={({ field }) => (
              <div className="form-check form-check-custom form-check-solid">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={field.value}
                  onChange={field.onChange}
                  id="isNewRegisteredUserActiveByDefault"
                />
                <label
                  className="form-check-label"
                  htmlFor="isNewRegisteredUserActiveByDefault"
                >
                  {L("NewRegisteredUsersIsActiveByDefault")}
                </label>
              </div>
            )}
          />
          <span className="form-text text-muted">
            {L("NewRegisteredUsersIsActiveByDefault_Hint")}
          </span>
        </Form.Item>
      )}

      <h6 className="mt-5 mb-3">{L("SecurityImage")}</h6>
      <Form.Item>
        <Controller
          name="userManagement.captchaSettings.useCaptchaOnRegistration"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                checked={field.value}
                onChange={field.onChange}
                id="useCaptchaOnRegistration"
              />
              <label
                className="form-check-label"
                htmlFor="useCaptchaOnRegistration"
              >
                {L("UseCaptchaOnRegistration")}
              </label>
            </div>
          )}
        />
      </Form.Item>
      <Form.Item>
        <Controller
          name="userManagement.captchaSettings.useCaptchaOnResetPassword"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                checked={field.value}
                onChange={field.onChange}
                id="useCaptchaOnResetPassword"
              />
              <label
                className="form-check-label"
                htmlFor="useCaptchaOnResetPassword"
              >
                {L("UseCaptchaOnResetPassword")}
              </label>
            </div>
          )}
        />
      </Form.Item>
      <Form.Item>
        <Controller
          name="userManagement.captchaSettings.useCaptchaOnEmailActivation"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                checked={field.value}
                onChange={field.onChange}
                id="useCaptchaOnEmailActivation"
              />
              <label
                className="form-check-label"
                htmlFor="useCaptchaOnEmailActivation"
              >
                {L("UseCaptchaOnEmailActivation")}
              </label>
            </div>
          )}
        />
      </Form.Item>
      <Form.Item className="mb-5">
        <Controller
          name="userManagement.captchaSettings.useCaptchaOnLogin"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                checked={field.value}
                onChange={field.onChange}
                id="useCaptchaOnLogin"
              />
              <label className="form-check-label" htmlFor="useCaptchaOnLogin">
                {L("UseCaptchaOnLogin")}
              </label>
            </div>
          )}
        />
      </Form.Item>

      {(!isMultiTenancyEnabled ||
        isRestrictedEmailDomainEnabledForApplication) && (
        <>
          <Form.Item>
            <Controller
              name="userManagement.isRestrictedEmailDomainEnabled"
              control={control}
              render={({ field }) => (
                <div className="form-check form-check-custom form-check-solid">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={field.value}
                    onChange={field.onChange}
                    id="isRestrictedEmailDomainEnabled"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="isRestrictedEmailDomainEnabled"
                  >
                    {L("IsRestrictedEmailDomainEnabled")}
                  </label>
                </div>
              )}
            />
            <span className="form-text text-muted">
              {L("RestrictedEmailDomainEnabled_Hint")}
            </span>
          </Form.Item>
          {restrictEmailEnabled && (
            <Form.Item className="mt-5">
              <label>
                <span className="form-text text-muted">
                  {L("RestrictedEmailDomainInfo")}
                </span>
                <Controller
                  name="userManagement.restrictedEmailDomain"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      className="form-control"
                      required
                      pattern="^[a-zA-Z0-9._%+-]+(?<!@)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                      placeholder={L("RestrictedEmailDomainPlaceholder")}
                      {...field}
                    />
                  )}
                />
              </label>
            </Form.Item>
          )}
        </>
      )}

      <h5 className="mt-5 mb-3">{L("CookieConsent")}</h5>
      <Form.Item>
        <Controller
          name="userManagement.isCookieConsentEnabled"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                checked={field.value}
                onChange={field.onChange}
                id="isCookieConsentEnabled"
              />
              <label
                className="form-check-label"
                htmlFor="isCookieConsentEnabled"
              >
                {L("IsCookieConsentEnabled")}
              </label>
            </div>
          )}
        />
      </Form.Item>

      <h5 className="mt-5 mb-3">{L("SessionTimeOut")}</h5>
      <Form.Item>
        <Controller
          name="userManagement.sessionTimeOutSettings.isEnabled"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                checked={field.value}
                onChange={field.onChange}
                id="sessionTimeOutEnabled"
              />
              <label
                className="form-check-label"
                htmlFor="sessionTimeOutEnabled"
              >
                {L("IsSessionTimeOutEnabled")}
              </label>
            </div>
          )}
        />
      </Form.Item>
      {isSessionTimeOutEnabled && (
        <>
          <Form.Item>
            <Controller
              name="userManagement.sessionTimeOutSettings.showLockScreenWhenTimedOut"
              control={control}
              render={({ field }) => (
                <div className="form-check form-check-custom form-check-solid">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={field.value}
                    onChange={field.onChange}
                    id="showLockScreenWhenTimedOut"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="showLockScreenWhenTimedOut"
                  >
                    {L("ShowLockScreenWhenTimedOut")}
                  </label>
                </div>
              )}
            />
          </Form.Item>
          <div className="mb-5 pt-1">
            <label
              className="form-label"
              htmlFor="Setting_SessionTimeOutSecond"
            >
              {L("SessionTimeOutSecond")}
            </label>
            <Controller
              name="userManagement.sessionTimeOutSettings.timeOutSecond"
              control={control}
              render={({ field }) => (
                <input
                  id="Setting_SessionTimeOutSecond"
                  type="number"
                  min={1}
                  {...field}
                  className="form-control"
                />
              )}
            />
          </div>
          <div className="mb-5">
            <label
              className="form-label"
              htmlFor="Setting_ShowTimeOutNotificationSecond"
            >
              {L("ShowTimeOutNotificationSecond")}
            </label>
            <Controller
              name="userManagement.sessionTimeOutSettings.showTimeOutNotificationSecond"
              control={control}
              render={({ field }) => (
                <input
                  id="Setting_ShowTimeOutNotificationSecond"
                  type="number"
                  min={1}
                  {...field}
                  className="form-control"
                />
              )}
            />
          </div>
        </>
      )}

      {(!isMultiTenancyEnabled ||
        isEmailPasswordlessLoginEnabledForApplication) && (
        <>
          <h5 className="mt-5 mb-3">{L("PasswordlessLogin")}</h5>
          {(!isMultiTenancyEnabled || isEmailProviderEnabledForApplication) && (
            <Form.Item>
              <Controller
                name="userManagement.passwordlessLogin.isEmailProviderEnabled"
                control={control}
                render={({ field }) => (
                  <div className="form-check form-check-custom form-check-solid">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={field.value}
                      onChange={field.onChange}
                      id="isEmailProviderEnabled"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="isEmailProviderEnabled"
                    >
                      {L("IsEmailPasswordlessLoginEnabled")}
                    </label>
                  </div>
                )}
              />
            </Form.Item>
          )}
          {(!isMultiTenancyEnabled || isSmsProviderEnabledForApplication) && (
            <Form.Item>
              <Controller
                name="userManagement.passwordlessLogin.isSmsProviderEnabled"
                control={control}
                render={({ field }) => (
                  <div className="form-check form-check-custom form-check-solid">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={field.value}
                      onChange={field.onChange}
                      id="isSmsProviderEnabled"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="isSmsProviderEnabled"
                    >
                      {L("IsSmsPasswordlessLoginEnabled")}
                    </label>
                  </div>
                )}
              />
            </Form.Item>
          )}
        </>
      )}

      {ldapIsModuleEnabled && (
        <>
          <h5 className="mt-4 mb-3">{L("LdapSettings")}</h5>
          <Form.Item>
            <Controller
              name="ldap.isEnabled"
              control={control}
              render={({ field }) => (
                <div className="form-check form-check-custom form-check-solid">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={field.value}
                    onChange={field.onChange}
                    id="ldapIsEnabled"
                  />
                  <label className="form-check-label" htmlFor="ldapIsEnabled">
                    {L("EnableLdapAuthentication")}
                  </label>
                </div>
              )}
            />
          </Form.Item>
          {ldapIsEnabled && (
            <>
              <Form.Item className="mt-5 mb-5">
                <Controller
                  name="ldap.useSsl"
                  control={control}
                  render={({ field }) => (
                    <div className="form-check form-check-custom form-check-solid">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={field.value}
                        onChange={field.onChange}
                        id="ldapUseSsl"
                      />
                      <label className="form-check-label" htmlFor="ldapUseSsl">
                        {L("UseSsl")}
                      </label>
                    </div>
                  )}
                />
              </Form.Item>
              <Form.Item label={L("DomainName")} className="mb-5">
                <Controller
                  name="ldap.domain"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      className="form-control"
                      maxLength={128}
                      {...field}
                    />
                  )}
                />
              </Form.Item>
              <Form.Item label={L("UserName")} className="mb-5">
                <Controller
                  name="ldap.userName"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      className="form-control"
                      maxLength={128}
                      {...field}
                    />
                  )}
                />
              </Form.Item>
              <Form.Item label={L("Password")} className="mb-5">
                <Controller
                  name="ldap.password"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="password"
                      className="form-control"
                      maxLength={128}
                      {...field}
                    />
                  )}
                />
              </Form.Item>
            </>
          )}
        </>
      )}

      <h5 className="mt-4 mb-3">{L("OtherSettings")}</h5>
      <Form.Item>
        <Controller
          name="userManagement.isEmailConfirmationRequiredForLogin"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                checked={field.value}
                onChange={field.onChange}
                id="isEmailConfirmationRequiredForLogin"
              />
              <label
                className="form-check-label"
                htmlFor="isEmailConfirmationRequiredForLogin"
              >
                {L("EmailConfirmationRequiredForLogin")}
              </label>
            </div>
          )}
        />
      </Form.Item>

      {isQrLoginEnabledForApplication && (
        <>
          <h5 className="mt-5 mb-3">{L("QrLogin")}</h5>
          <Form.Item>
            <Controller
              name="userManagement.isQrLoginEnabled"
              control={control}
              render={({ field }) => (
                <div className="form-check form-check-custom form-check-solid">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={field.value}
                    onChange={field.onChange}
                    id="isQrLoginEnabled"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="isQrLoginEnabled"
                  >
                    {L("IsQrLoginEnabled")}
                  </label>
                </div>
              )}
            />
          </Form.Item>
        </>
      )}

      <h5 className="mt-5 mb-3">{L("Profile")}</h5>
      <Form.Item>
        <Controller
          name="userManagement.allowUsingGravatarProfilePicture"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                checked={field.value}
                onChange={field.onChange}
                id="allowUsingGravatarProfilePicture"
              />
              <label
                className="form-check-label"
                htmlFor="allowUsingGravatarProfilePicture"
              >
                {L("AllowUsingGravatarProfilePicture")}
              </label>
            </div>
          )}
        />
      </Form.Item>
    </Form>
  );
};

export default UserManagementTab;
