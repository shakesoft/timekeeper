import React from "react";
import { Form } from "antd";
import { type Control, Controller, type UseFormWatch } from "react-hook-form";
import { TenantSettingsEditDto } from "@api/generated/service-proxies";
import L from "@/lib/L";

interface Props {
  control: Control<TenantSettingsEditDto>;
  watch: UseFormWatch<TenantSettingsEditDto>;
}

const SecuritySettingsTab: React.FC<Props> = ({ control, watch }) => {
  const isMultiTenancyEnabled = abp.multiTenancy.isEnabled;
  const useDefaultPasswordComplexity = watch(
    "security.useDefaultPasswordComplexitySettings",
  );
  const enableCheckingLastXPassword = watch(
    "security.userPasswordSettings.enableCheckingLastXPasswordWhenPasswordChange",
  );
  const enablePasswordExpiration = watch(
    "security.userPasswordSettings.enablePasswordExpiration",
  );
  const userLockoutEnabled = watch("security.userLockOut.isEnabled");
  const twoFactorLoginEnabled = watch("security.twoFactorLogin.isEnabled");
  const twoFactorLoginEnabledForApplication = watch(
    "security.twoFactorLogin.isEnabledForApplication",
  );

  return (
    <Form layout="vertical">
      <h5 className="mb-3">{L("PasswordComplexity")}</h5>
      <Form.Item>
        <Controller
          name="security.useDefaultPasswordComplexitySettings"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                checked={field.value}
                onChange={field.onChange}
                id="useDefaultPasswordComplexitySettings"
              />
              <label
                className="form-check-label"
                htmlFor="useDefaultPasswordComplexitySettings"
              >
                {L("UseDefaultSettings")}
              </label>
            </div>
          )}
        />
      </Form.Item>

      <div className="ps-5">
        <Form.Item>
          <Controller
            name={
              useDefaultPasswordComplexity
                ? "security.defaultPasswordComplexity.requireDigit"
                : "security.passwordComplexity.requireDigit"
            }
            control={control}
            render={({ field }) => (
              <div className="form-check form-check-custom form-check-solid">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={useDefaultPasswordComplexity}
                  id="requireDigit"
                />
                <label className="form-check-label" htmlFor="requireDigit">
                  {L("PasswordComplexity_RequireDigit")}
                </label>
              </div>
            )}
          />
        </Form.Item>
        <Form.Item>
          <Controller
            name={
              useDefaultPasswordComplexity
                ? "security.defaultPasswordComplexity.requireLowercase"
                : "security.passwordComplexity.requireLowercase"
            }
            control={control}
            render={({ field }) => (
              <div className="form-check form-check-custom form-check-solid">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={useDefaultPasswordComplexity}
                  id="requireLowercase"
                />
                <label className="form-check-label" htmlFor="requireLowercase">
                  {L("PasswordComplexity_RequireLowercase")}
                </label>
              </div>
            )}
          />
        </Form.Item>
        <Form.Item>
          <Controller
            name={
              useDefaultPasswordComplexity
                ? "security.defaultPasswordComplexity.requireUppercase"
                : "security.passwordComplexity.requireUppercase"
            }
            control={control}
            render={({ field }) => (
              <div className="form-check form-check-custom form-check-solid">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={useDefaultPasswordComplexity}
                  id="requireUppercase"
                />
                <label className="form-check-label" htmlFor="requireUppercase">
                  {L("PasswordComplexity_RequireUppercase")}
                </label>
              </div>
            )}
          />
        </Form.Item>
        <Form.Item>
          <Controller
            name={
              useDefaultPasswordComplexity
                ? "security.defaultPasswordComplexity.requireNonAlphanumeric"
                : "security.passwordComplexity.requireNonAlphanumeric"
            }
            control={control}
            render={({ field }) => (
              <div className="form-check form-check-custom form-check-solid">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={useDefaultPasswordComplexity}
                  id="requireNonAlphanumeric"
                />
                <label
                  className="form-check-label"
                  htmlFor="requireNonAlphanumeric"
                >
                  {L("PasswordComplexity_RequireNonAlphanumeric")}
                </label>
              </div>
            )}
          />
        </Form.Item>
        <div className="mb-5">
          <label
            className="form-label"
            htmlFor="PasswordComplexity_RequiredLength"
          >
            {L("PasswordComplexity_RequiredLength")}
          </label>
          <Controller
            name={
              useDefaultPasswordComplexity
                ? "security.defaultPasswordComplexity.requiredLength"
                : "security.passwordComplexity.requiredLength"
            }
            control={control}
            render={({ field }) => (
              <input
                id="PasswordComplexity_RequiredLength"
                type="number"
                min={1}
                {...field}
                disabled={useDefaultPasswordComplexity}
                className="form-control"
              />
            )}
          />
        </div>
      </div>

      {!isMultiTenancyEnabled && (
        <>
          <h5 className="mt-5 mb-3">{L("Password")}</h5>
          <Form.Item>
            <Controller
              name="security.userPasswordSettings.enableCheckingLastXPasswordWhenPasswordChange"
              control={control}
              render={({ field }) => (
                <div className="form-check form-check-custom form-check-solid">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={field.value}
                    onChange={field.onChange}
                    id="enableCheckingLastXPassword"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="enableCheckingLastXPassword"
                  >
                    {L(
                      "EnableCheckingLastXPasswordWhenPasswordChangeSettingLabel",
                    )}
                  </label>
                </div>
              )}
            />
          </Form.Item>
          {enableCheckingLastXPassword && (
            <div className="mb-5 pt-1">
              <label
                className="form-label"
                htmlFor="CheckingLastXPasswordCount"
              >
                {L("CheckingLastXPasswordCountSettingLabel")}
              </label>
              <Controller
                name="security.userPasswordSettings.checkingLastXPasswordCount"
                control={control}
                render={({ field }) => (
                  <input
                    id="CheckingLastXPasswordCount"
                    type="number"
                    min={1}
                    {...field}
                    className="form-control"
                  />
                )}
              />
            </div>
          )}
          <Form.Item>
            <Controller
              name="security.userPasswordSettings.enablePasswordExpiration"
              control={control}
              render={({ field }) => (
                <div className="form-check form-check-custom form-check-solid">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={field.value}
                    onChange={field.onChange}
                    id="enablePasswordExpiration"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="enablePasswordExpiration"
                  >
                    {L("EnablePasswordExpirationSettingLabel")}
                  </label>
                </div>
              )}
            />
          </Form.Item>
          {enablePasswordExpiration && (
            <>
              <div className="mb-5 pt-1">
                <label
                  className="form-label"
                  htmlFor="PasswordExpirationDayCount"
                >
                  {L("PasswordExpirationDayCountSettingLabel")}
                </label>
                <Controller
                  name="security.userPasswordSettings.passwordExpirationDayCount"
                  control={control}
                  render={({ field }) => (
                    <input
                      id="PasswordExpirationDayCount"
                      type="number"
                      min={1}
                      {...field}
                      className="form-control"
                    />
                  )}
                />
              </div>
              <div className="mb-5 pt-1">
                <label
                  className="form-label"
                  htmlFor="PasswordResetCodeExpirationHours"
                >
                  {L("PasswordResetCodeExpirationHoursSettingLabel")}
                </label>
                <Controller
                  name="security.userPasswordSettings.passwordResetCodeExpirationHours"
                  control={control}
                  render={({ field }) => (
                    <input
                      id="PasswordResetCodeExpirationHours"
                      type="number"
                      min={1}
                      {...field}
                      className="form-control"
                      required
                    />
                  )}
                />
              </div>
            </>
          )}
        </>
      )}

      <h5 className="mt-5 mb-3">{L("UserLockOut")}</h5>
      <Form.Item>
        <Controller
          name="security.userLockOut.isEnabled"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                checked={field.value}
                onChange={field.onChange}
                id="userLockOutIsEnabled"
              />
              <label
                className="form-check-label"
                htmlFor="userLockOutIsEnabled"
              >
                {L("EnableUserAccountLockingOnFailedLoginAttempts")}
              </label>
            </div>
          )}
        />
      </Form.Item>
      {userLockoutEnabled && (
        <>
          <div className="mb-5">
            <label
              className="form-label"
              htmlFor="MaxFailedAccessAttemptsBeforeLockout"
            >
              {L("MaxFailedAccessAttemptsBeforeLockout")}
            </label>
            <Controller
              name="security.userLockOut.maxFailedAccessAttemptsBeforeLockout"
              control={control}
              render={({ field }) => (
                <input
                  id="MaxFailedAccessAttemptsBeforeLockout"
                  type="number"
                  {...field}
                  className="form-control"
                />
              )}
            />
          </div>
          <div className="mb-5">
            <label
              className="form-label"
              htmlFor="DefaultAccountLockoutSeconds"
            >
              {L("DefaultAccountLockoutDurationAsSeconds")}
            </label>
            <Controller
              name="security.userLockOut.defaultAccountLockoutSeconds"
              control={control}
              render={({ field }) => (
                <input
                  id="DefaultAccountLockoutSeconds"
                  type="number"
                  {...field}
                  className="form-control"
                />
              )}
            />
          </div>
        </>
      )}

      {(!isMultiTenancyEnabled || twoFactorLoginEnabledForApplication) && (
        <>
          <h5 className="mt-5 mb-3">{L("TwoFactorLogin")}</h5>
          <Form.Item>
            <Controller
              name="security.twoFactorLogin.isEnabled"
              control={control}
              render={({ field }) => (
                <div className="form-check form-check-custom form-check-solid">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={field.value}
                    onChange={field.onChange}
                    id="twoFactorLoginIsEnabled"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="twoFactorLoginIsEnabled"
                  >
                    {L("EnableTwoFactorLogin")}
                  </label>
                </div>
              )}
            />
          </Form.Item>
          {twoFactorLoginEnabled &&
            (!isMultiTenancyEnabled || twoFactorLoginEnabledForApplication) && (
              <>
                <Form.Item>
                  <Controller
                    name="security.twoFactorLogin.isEmailProviderEnabled"
                    control={control}
                    render={({ field }) => (
                      <div className="form-check form-check-custom form-check-solid">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={field.value}
                          onChange={field.onChange}
                          id="twoFactorEmailProviderEnabled"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="twoFactorEmailProviderEnabled"
                        >
                          {L("IsEmailVerificationEnabled")}
                        </label>
                      </div>
                    )}
                  />
                </Form.Item>
                <Form.Item>
                  <Controller
                    name="security.twoFactorLogin.isSmsProviderEnabled"
                    control={control}
                    render={({ field }) => (
                      <div className="form-check form-check-custom form-check-solid">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={field.value}
                          onChange={field.onChange}
                          id="twoFactorSmsProviderEnabled"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="twoFactorSmsProviderEnabled"
                        >
                          {L("IsSmsVerificationEnabled")}
                        </label>
                      </div>
                    )}
                  />
                </Form.Item>
                <Form.Item>
                  <Controller
                    name="security.twoFactorLogin.isGoogleAuthenticatorEnabled"
                    control={control}
                    render={({ field }) => (
                      <div className="form-check form-check-custom form-check-solid">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={field.value}
                          onChange={field.onChange}
                          id="twoFactorGoogleAuthenticatorEnabled"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="twoFactorGoogleAuthenticatorEnabled"
                        >
                          {L("IsGoogleAuthenticatorEnabled")}
                        </label>
                      </div>
                    )}
                  />
                </Form.Item>
                <Form.Item>
                  <Controller
                    name="security.twoFactorLogin.isRememberBrowserEnabled"
                    control={control}
                    render={({ field }) => (
                      <div className="form-check form-check-custom form-check-solid">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={field.value}
                          onChange={field.onChange}
                          id="twoFactorRememberBrowserEnabled"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="twoFactorRememberBrowserEnabled"
                        >
                          {L("AllowToRememberBrowserForTwoFactorLogin")}
                        </label>
                      </div>
                    )}
                  />
                </Form.Item>
              </>
            )}
        </>
      )}

      {!isMultiTenancyEnabled && (
        <>
          <h5 className="mt-5 mb-3">{L("OneConcurrentLoginPerUser")}</h5>
          <Form.Item>
            <Controller
              name="security.allowOneConcurrentLoginPerUser"
              control={control}
              render={({ field }) => (
                <div className="form-check form-check-custom form-check-solid">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={field.value}
                    onChange={field.onChange}
                    id="allowOneConcurrentLoginPerUser"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="allowOneConcurrentLoginPerUser"
                  >
                    {L("OneConcurrentLoginPerUserActive")}
                  </label>
                </div>
              )}
            />
          </Form.Item>
        </>
      )}
    </Form>
  );
};

export default SecuritySettingsTab;
