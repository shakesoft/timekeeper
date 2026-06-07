import React from "react";
import { Form } from "antd";
import { type Control, Controller, type UseFormWatch } from "react-hook-form";
import { HostSettingsEditDto } from "@api/generated/service-proxies";
import L from "@/lib/L";

interface Props {
  control: Control<HostSettingsEditDto>;
  watch: UseFormWatch<HostSettingsEditDto>;
}

const UserManagementTab: React.FC<Props> = ({ control, watch }) => {
  const isSessionTimeOutEnabled = watch(
    "userManagement.sessionTimeOutSettings.isEnabled",
  );

  return (
    <Form layout="vertical">
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
                id="emailConfirmationRequired"
              />
              <label
                className="form-check-label"
                htmlFor="emailConfirmationRequired"
              >
                {L("EmailConfirmationRequiredForLogin")}
              </label>
            </div>
          )}
        />
      </Form.Item>
      <Form.Item>
        <Controller
          name="userManagement.smsVerificationEnabled"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                checked={field.value}
                onChange={field.onChange}
                id="smsVerificationEnabled"
              />
              <label
                className="form-check-label"
                htmlFor="smsVerificationEnabled"
              >
                {L("SmsVerificationEnabled")}
              </label>
            </div>
          )}
        />
      </Form.Item>
      <Form.Item>
        <Controller
          name="userManagement.useCaptchaOnLogin"
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

      <h5 className="mt-5 mb-3">{L("PasswordlessLogin")}</h5>
      <Form.Item>
        <Controller
          name="userManagement.passwordlessLogin.isEmailProviderEnabledForApplication"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                checked={field.value}
                onChange={field.onChange}
                id="emailPasswordlessLoginEnabled"
              />
              <label
                className="form-check-label"
                htmlFor="emailPasswordlessLoginEnabled"
              >
                {L("IsEmailPasswordlessLoginEnabled")}
              </label>
            </div>
          )}
        />
      </Form.Item>
      <Form.Item>
        <Controller
          name="userManagement.passwordlessLogin.isSmsProviderEnabledForApplication"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                checked={field.value}
                onChange={field.onChange}
                id="smsPasswordlessLoginEnabled"
              />
              <label
                className="form-check-label"
                htmlFor="smsPasswordlessLoginEnabled"
              >
                {L("IsSmsPasswordlessLoginEnabled")}
              </label>
            </div>
          )}
        />
      </Form.Item>

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
                id="cookieConsentEnabled"
              />
              <label
                className="form-check-label"
                htmlFor="cookieConsentEnabled"
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
                id="qrLoginEnabled"
              />
              <label className="form-check-label" htmlFor="qrLoginEnabled">
                {L("IsQrLoginEnabled")}
              </label>
            </div>
          )}
        />
      </Form.Item>

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
      <div className="mt-5 mb-5">
        <label
          className="form-label"
          htmlFor="Setting_MaxProfilePictureSizeInMB"
        >
          {L("MaximumProfilePictureFileSize")}
        </label>
        <Controller
          name="userManagement.maxProfilePictureSizeInMB"
          control={control}
          render={({ field }) => (
            <input
              id="Setting_MaxProfilePictureSizeInMB"
              type="number"
              min={0.1}
              step={0.01}
              {...field}
              className="form-control"
            />
          )}
        />
      </div>
      <div className="row">
        <div className="col-6">
          <div className="mb-5">
            <label
              className="form-label"
              htmlFor="Setting_MaxProfilePictureWidth"
            >
              {L("MaximumProfilePictureWidth")}
            </label>
            <Controller
              name="userManagement.maxProfilePictureWidth"
              control={control}
              render={({ field }) => (
                <input
                  id="Setting_MaxProfilePictureWidth"
                  type="number"
                  min={1}
                  {...field}
                  className="form-control"
                />
              )}
            />
          </div>
        </div>
        <div className="col-6">
          <div className="mb-5">
            <label
              className="form-label"
              htmlFor="Setting_MaxProfilePictureHeight"
            >
              {L("MaximumProfilePictureHeight")}
            </label>
            <Controller
              name="userManagement.maxProfilePictureHeight"
              control={control}
              render={({ field }) => (
                <input
                  id="Setting_MaxProfilePictureHeight"
                  type="number"
                  min={1}
                  {...field}
                  className="form-control"
                />
              )}
            />
          </div>
        </div>
      </div>
    </Form>
  );
};

export default UserManagementTab;
