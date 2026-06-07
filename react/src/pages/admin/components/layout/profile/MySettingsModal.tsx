import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Modal, Form, Tabs, Tooltip } from "antd";
import {
  CurrentUserProfileEditDto,
  ProfileServiceProxy,
  SendVerificationSmsInputDto,
  SettingScopes,
  VerifyAuthenticatorCodeInput,
} from "@api/generated/service-proxies";
import TimezoneDropdown from "../../common/timing/TimezoneDropdown";
import EnableTwoFactorAuthModal, {
  EnableTwoFactorAuthModalHandle,
} from "./two-factor-auth/EnableTwoFactorAuthModal";
import ViewRecoveryCodesModal, {
  ViewRecoveryCodesModalHandle,
} from "./two-factor-auth/ViewRecoveryCodesModal";
import VerifyCodeModal, {
  VerifyCodeModalHandle,
} from "./two-factor-auth/VerifyCodeModal";
import SmsVerificationModal, {
  SmsVerificationModalHandle,
} from "./two-factor-auth/SmsVerificationModal";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

export type MySettingsModalHandle = { show: () => void };

const MySettingsModal = forwardRef<MySettingsModalHandle>((_props, ref) => {
  const profileService = useServiceProxy(ProfileServiceProxy, []);
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<CurrentUserProfileEditDto | null>(null);
  const [isGoogleAuthEnabled, setIsGoogleAuthEnabled] = useState(false);
  const [isPhoneConfirmed, setIsPhoneConfirmed] = useState(false);
  const [canChangeUserName, setCanChangeUserName] = useState(true);
  const [initialTimezone, setInitialTimezone] = useState<string | undefined>(
    undefined,
  );
  const [form] = Form.useForm<CurrentUserProfileEditDto>();
  const enableRef = useRef<EnableTwoFactorAuthModalHandle>(null);
  const viewCodesRef = useRef<ViewRecoveryCodesModalHandle>(null);
  const verifyRef = useRef<VerifyCodeModalHandle>(null);
  const smsRef = useRef<SmsVerificationModalHandle>(null);

  const show = async () => {
    const result = await profileService.getCurrentUserProfileForEdit();
    setUser(result);
    setIsGoogleAuthEnabled(result.isGoogleAuthenticatorEnabled ?? false);
    setIsPhoneConfirmed(result.isPhoneNumberConfirmed ?? false);
    setInitialTimezone(result.timezone ?? undefined);
    setCanChangeUserName((result.userName || "").toLowerCase() !== "admin");
    form.setFieldsValue(result);
    setVisible(true);
  };
  useImperativeHandle(ref, () => ({ show }));

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const dto = new CurrentUserProfileEditDto(values);
      await profileService.updateCurrentUserProfile(dto);
      abp?.notify?.info?.(L("SavedSuccessfully"));
      setVisible(false);
      if (
        abp?.clock?.provider?.supportsMultipleTimezone &&
        initialTimezone !== values.timezone
      ) {
        abp?.message
          ?.info?.(L("TimeZoneSettingChangedRefreshPageNotification"))
          .then?.(() => window.location.reload());
      }
    } finally {
      setSaving(false);
    }
  };

  const sendSmsVerification = async () => {
    const phone = form.getFieldValue("phoneNumber");
    const input = new SendVerificationSmsInputDto();
    input.phoneNumber = phone;
    await profileService.sendVerificationSms(input);
    smsRef.current?.show(phone);
  };

  const disableTwoFactor = async () => {
    verifyRef.current?.show();
  };

  const onDisableVerified = async (verify: VerifyAuthenticatorCodeInput) => {
    setSaving(true);
    try {
      await profileService.disableGoogleAuthenticator(verify);
      setIsGoogleAuthEnabled(false);
      abp?.message?.success?.(L("TwoFactorAuthenticationDisabled"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <EnableTwoFactorAuthModal
        ref={enableRef}
        onEnabled={() => {
          setIsGoogleAuthEnabled(true);
        }}
      />
      <ViewRecoveryCodesModal ref={viewCodesRef} />
      <VerifyCodeModal ref={verifyRef} onVerified={onDisableVerified} />
      <SmsVerificationModal
        ref={smsRef}
        onVerified={() => {
          setIsPhoneConfirmed(true);
        }}
      />
      <Modal
        title={L("MySettings")}
        open={visible}
        onCancel={() => setVisible(false)}
        width={900}
        footer={[
          <button
            key="cancel"
            type="button"
            className="btn btn-light-primary fw-bold"
            onClick={() => setVisible(false)}
            disabled={saving}
          >
            {L("Cancel")}
          </button>,
          <button
            key="save"
            type="button"
            className="btn btn-primary fw-bold ms-3"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            <i className="fa fa-save" />
            <span className="ms-2">{L("Save")}</span>
          </button>,
        ]}
        destroyOnHidden
      >
        {user && (
          <Tabs
            items={[
              {
                key: "profile",
                label: L("Profile"),
                children: (
                  <Form layout="vertical" form={form}>
                    <div className="row">
                      <div className="mb-5 mt-5">
                        <label className="form-label required" htmlFor="Name">
                          {L("FirstName")}
                        </label>
                        <Form.Item
                          name="name"
                          rules={[{ required: true, max: 64 }]}
                          className="mb-0"
                        >
                          <input
                            id="Name"
                            className="form-control"
                            type="text"
                          />
                        </Form.Item>
                      </div>
                      <div className="mb-5">
                        <label
                          className="form-label required"
                          htmlFor="Surname"
                        >
                          {L("Surname")}
                        </label>
                        <Form.Item
                          name="surname"
                          rules={[{ required: true, max: 64 }]}
                          className="mb-0"
                        >
                          <input
                            id="Surname"
                            className="form-control"
                            type="text"
                          />
                        </Form.Item>
                      </div>
                    </div>
                    <div className="mb-5">
                      <label
                        className="form-label required"
                        htmlFor="EmailAddress"
                      >
                        {L("EmailAddress")}
                      </label>
                      <Form.Item
                        name="emailAddress"
                        rules={[{ required: true, type: "email", max: 256 }]}
                        className="mb-0"
                      >
                        <input
                          id="EmailAddress"
                          className="form-control"
                          type="email"
                        />
                      </Form.Item>
                    </div>

                    {abp?.setting?.getBoolean?.(
                      "App.UserManagement.SmsVerificationEnabled",
                    ) && (
                      <div className="mb-5">
                        <label className="form-label">{L("PhoneNumber")}</label>
                        <div className="input-group">
                          <Form.Item
                            name="phoneNumber"
                            noStyle
                            rules={[{ max: 32 }]}
                          >
                            <input className="form-control" type="text" />
                          </Form.Item>
                          <span className="input-group-append">
                            <button
                              id="btnSmsVerification"
                              type="button"
                              onClick={() => void sendSmsVerification()}
                              disabled={
                                isPhoneConfirmed &&
                                user.phoneNumber ===
                                  form.getFieldValue("phoneNumber")
                              }
                              className="btn btn-primary"
                            >
                              <i className="fa fa-exclamation-triangle" />{" "}
                              {L("Verify")}
                            </button>
                          </span>
                          {isPhoneConfirmed &&
                            user.phoneNumber ===
                              form.getFieldValue("phoneNumber") && (
                              <div className="input-group-append">
                                <Tooltip title={L("YourPhoneNumberIsVerified")}>
                                  <span className="input-group-text">
                                    <i
                                      className="la la-check label-success"
                                      aria-label={L("Verified")}
                                    />
                                  </span>
                                </Tooltip>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    <div className="mb-5">
                      <label className="form-label required" htmlFor="UserName">
                        {L("UserName")}
                      </label>
                      <Form.Item
                        name="userName"
                        rules={[{ required: true, max: 256 }]}
                        className="mb-0"
                      >
                        <input
                          id="UserName"
                          className="form-control"
                          type="text"
                          disabled={!canChangeUserName}
                        />
                      </Form.Item>
                      {!canChangeUserName && (
                        <span className="form-text text-muted">
                          {L("CanNotChangeAdminUserName")}
                        </span>
                      )}
                    </div>

                    {abp?.clock?.provider?.supportsMultipleTimezone && (
                      <div className="mb-5">
                        <label className="form-label" htmlFor="Timezone">
                          {L("Timezone")}
                        </label>
                        <Form.Item name="timezone" className="mb-0">
                          <TimezoneDropdown
                            defaultTimezoneScope={SettingScopes.User}
                          />
                        </Form.Item>
                      </div>
                    )}

                    {(!abp?.multiTenancy?.isEnabled ||
                      abp?.setting?.getBoolean?.(
                        "Abp.Zero.UserManagement.TwoFactorLogin.IsEnabled",
                      )) && (
                      <div className="mt-4">
                        {isGoogleAuthEnabled ? (
                          <div>
                            <div className="mb-3 fw-semibold">
                              <h4
                                className="fw-bold fs-3 d-flex align-items-center"
                                style={{ color: "#2b9348" }}
                              >
                                <i className="fa-solid fa-lock me-2" />
                                {L("AuthenticatorAppEnabled")}
                              </h4>
                              <span className="form-text text-muted">
                                {L("AuthenticatorAppEnabledDescription")}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm me-2"
                              onClick={() => viewCodesRef.current?.show()}
                            >
                              {L("ViewRecoveryCodes")}
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => void disableTwoFactor()}
                            >
                              {L("DisableAuthenticatorApp")}
                            </button>
                          </div>
                        ) : (
                          <div className="notice d-flex bg-light-primary rounded border-primary border border-dashed p-6">
                            <span className="svg-icon svg-icon-2tx svg-icon-primary me-4">
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  opacity="0.3"
                                  d="M20.5543 4.37824L12.1798 2.02473C12.0626 1.99176 11.9376 1.99176 11.8203 2.02473L3.44572 4.37824C3.18118 4.45258 3 4.6807 3 4.93945V13.569C3 14.6914 3.48509 15.8404 4.4417 16.984C5.17231 17.8575 6.18314 18.7345 7.446 19.5909C9.56752 21.0295 11.6566 21.912 11.7445 21.9488C11.8258 21.9829 11.9129 22 12.0001 22C12.0872 22 12.1744 21.983 12.2557 21.9488C12.3435 21.912 14.4326 21.0295 16.5541 19.5909C17.8169 18.7345 18.8277 17.8575 19.5584 16.984C20.515 15.8404 21 14.6914 21 13.569V4.93945C21 4.6807 20.8189 4.45258 20.5543 4.37824Z"
                                  fill="currentColor"
                                ></path>
                                <path
                                  d="M10.5606 11.3042L9.57283 10.3018C9.28174 10.0065 8.80522 10.0065 8.51412 10.3018C8.22897 10.5912 8.22897 11.0559 8.51412 11.3452L10.4182 13.2773C10.8099 13.6747 11.451 13.6747 11.8427 13.2773L15.4859 9.58051C15.771 9.29117 15.771 8.82648 15.4859 8.53714C15.1948 8.24176 14.7183 8.24176 14.4272 8.53714L11.7002 11.3042C11.3869 11.6221 10.874 11.6221 10.5606 11.3042Z"
                                  fill="currentColor"
                                ></path>
                              </svg>
                            </span>
                            <div className="d-flex flex-stack flex-grow-1 flex-wrap flex-md-nowrap">
                              <div className="mb-3 mb-md-0 fw-semibold">
                                <h4 className="text-gray-900 fw-bold">
                                  {L("EnableAuthenticatorApp")}
                                </h4>
                                <div className="fs-6 text-gray-700 pe-7">
                                  {L("EnableAuthenticatorAppDescription")}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => enableRef.current?.show()}
                                className="btn btn-primary px-6 align-self-center text-nowrap"
                                id="enableTwoFactorAuthenticationButton"
                              >
                                {L("Enable")}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Form>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </>
  );
});

export default MySettingsModal;
