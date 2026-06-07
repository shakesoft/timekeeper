import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Modal, Form, Select, DatePicker } from "antd";
import { Controller, useForm } from "react-hook-form";
import {
  CreateTenantInput,
  SubscribableEditionComboboxItemDto,
  GetPasswordComplexitySettingOutput,
  TenantServiceProxy,
  CommonLookupServiceProxy,
  ProfileServiceProxy,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@api/service-proxy-factory";
import L from "@/lib/L";
import { getPasswordComplexityErrors } from "@/lib/password-complexity";
import { Dayjs } from "dayjs";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onSaved: () => void;
};

type FormValues = {
  tenancyName: string;
  name: string;
  useHostDb: boolean;
  connectionString?: string;
  adminName?: string;
  adminSurname?: string;
  adminEmailAddress: string;
  setRandomPassword: boolean;
  adminPassword?: string;
  adminPasswordRepeat?: string;
  editionId?: number | null;
  isUnlimited: boolean;
  subscriptionEndDateUtc?: Dayjs | null;
  isInTrialPeriod: boolean;
  shouldChangePasswordOnNextLogin: boolean;
  sendActivationEmail: boolean;
  isActive: boolean;
};

const nameRegex = /^[a-zA-Z][a-zA-Z0-9_-]{1,}$/;

const CreateTenantModal: React.FC<Props> = ({
  isVisible,
  onClose,
  onSaved,
}) => {
  const tenantService = useServiceProxy(TenantServiceProxy, []);
  const lookupService = useServiceProxy(CommonLookupServiceProxy, []);
  const profileService = useServiceProxy(ProfileServiceProxy, []);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      tenancyName: "",
      name: "",
      useHostDb: true,
      connectionString: "",
      adminName: "",
      adminSurname: "",
      adminEmailAddress: "",
      setRandomPassword: true,
      adminPassword: "",
      adminPasswordRepeat: "",
      editionId: 0,
      isUnlimited: true,
      subscriptionEndDateUtc: null,
      isInTrialPeriod: false,
      shouldChangePasswordOnNextLogin: true,
      sendActivationEmail: true,
      isActive: true,
    },
  });

  const [saving, setSaving] = useState(false);
  const [editions, setEditions] = useState<
    SubscribableEditionComboboxItemDto[]
  >([]);
  const [passwordSetting, setPasswordSetting] =
    useState<GetPasswordComplexitySettingOutput | null>(null);
  const [isSubscriptionFieldsVisible, setSubscriptionFieldsVisible] =
    useState(false);
  const [isSelectedEditionFree, setSelectedEditionFree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
  const tenancyNameRef = useRef<HTMLInputElement>(null);
  const delayedFocus = useDelayedFocus();

  const editionOptions = useMemo(
    () =>
      (editions ?? []).map((e) => ({
        label: e.displayText,
        value: e.value ? Number(e.value) : 0,
      })),
    [editions],
  );

  const setDefaults = useCallback(() => {
    reset({
      tenancyName: "",
      name: "",
      useHostDb: true,
      connectionString: "",
      adminName: "",
      adminSurname: "",
      adminEmailAddress: "",
      setRandomPassword: true,
      adminPassword: "",
      adminPasswordRepeat: "",
      editionId: 0,
      isUnlimited: true,
      subscriptionEndDateUtc: null,
      isInTrialPeriod: false,
      shouldChangePasswordOnNextLogin: true,
      sendActivationEmail: true,
      isActive: true,
    });

    setShowPassword(false);
    setShowPasswordRepeat(false);
    setSubscriptionFieldsVisible(false);
    setSelectedEditionFree(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    setDefaults();
    profileService.getPasswordComplexitySetting().then(setPasswordSetting);

    const loadEditions = async () => {
      const res = await lookupService.getEditionsForCombobox(false);
      const items = res.items ?? [];
      const notAssigned = new SubscribableEditionComboboxItemDto({
        value: undefined,
        displayText: L("NotAssigned"),
        isSelected: false,
        isFree: false,
      });
      const list = [notAssigned, ...items];

      let defaultEditionId = 0;
      const defaultEditionName = await lookupService.getDefaultEditionName();
      const found = list.find((x) => x.displayText === defaultEditionName.name);
      defaultEditionId = found?.value ? Number(found.value) : 0;

      const selected = list.find(
        (e) => (e.value ?? "") === String(defaultEditionId),
      );
      const free = !!selected?.isFree;
      setSelectedEditionFree(free);
      const visible = defaultEditionId > 0 && !free;
      setSubscriptionFieldsVisible(visible);

      setEditions(list);

      setTimeout(() => {
        setValue("editionId", defaultEditionId);

        if (free || defaultEditionId === 0) {
          setValue("isUnlimited", true);
          setValue("isInTrialPeriod", false);
          setValue("subscriptionEndDateUtc", null);
        }
      }, 0);
    };

    loadEditions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const onEditionChange = (editionId?: number | null) => {
    const id = editionId ?? getValues("editionId") ?? 0;
    const selected = editions.find((e) => (e.value ?? "") === String(id));
    const free = !!selected?.isFree;
    setSelectedEditionFree(free);
    const visible = id > 0 && !free;
    setSubscriptionFieldsVisible(visible);
    if (free) {
      const currentUnlimited = !!getValues("isUnlimited");
      const currentTrial = !!getValues("isInTrialPeriod");
      if (!currentUnlimited) setValue("isUnlimited", true);
      if (currentTrial) setValue("isInTrialPeriod", false);
    }
  };

  const onUnlimitedChange = (checked: boolean) => {
    if (checked) {
      setValue("subscriptionEndDateUtc", null);
      setValue("isInTrialPeriod", false);
    }
  };

  const validatePassword = (value?: string) => {
    if (!value || setRandomPassword) return true;
    const errors = getPasswordComplexityErrors(value, passwordSetting?.setting);
    return errors[0] || true;
  };

  const setRandomPassword = watch("setRandomPassword");
  const useHostDb = watch("useHostDb");
  const isUnlimited = watch("isUnlimited");
  const adminPassword = watch("adminPassword") || "";
  const adminPasswordRepeat = watch("adminPasswordRepeat") || "";

  const passwordsMismatch = useMemo(
    () =>
      !setRandomPassword &&
      !!adminPasswordRepeat &&
      adminPasswordRepeat !== adminPassword,
    [setRandomPassword, adminPassword, adminPasswordRepeat],
  );

  const inlinePasswordErrors = useMemo(() => {
    if (setRandomPassword) return [] as string[];
    return getPasswordComplexityErrors(adminPassword, passwordSetting?.setting);
  }, [setRandomPassword, passwordSetting, adminPassword]);

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const input = new CreateTenantInput();
      input.tenancyName = values.tenancyName?.trim();
      input.name = values.name?.trim();
      input.adminName = values.adminName?.trim() || undefined;
      input.adminSurname = values.adminSurname?.trim() || undefined;
      input.adminEmailAddress = values.adminEmailAddress?.trim();
      input.adminPassword = values.setRandomPassword
        ? undefined
        : values.adminPassword?.trim() || undefined;
      input.connectionString = values.useHostDb
        ? undefined
        : values.connectionString?.trim() || undefined;
      input.shouldChangePasswordOnNextLogin =
        values.shouldChangePasswordOnNextLogin;
      input.sendActivationEmail = values.sendActivationEmail;
      input.editionId =
        values.editionId && values.editionId > 0 ? values.editionId : undefined;
      input.isActive = values.isActive;

      if (values.isUnlimited) {
        input.isInTrialPeriod = false;
        input.subscriptionEndDateUtc = undefined;
      } else if (input.editionId && input.editionId > 0) {
        input.isInTrialPeriod = values.isInTrialPeriod;
        input.subscriptionEndDateUtc = values.subscriptionEndDateUtc
          ? values.subscriptionEndDateUtc
          : undefined;
      } else {
        input.isInTrialPeriod = false;
        input.subscriptionEndDateUtc = undefined;
      }

      await tenantService.createTenant(input);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={isVisible}
      onCancel={onClose}
      title={L("CreateNewTenant")}
      width={720}
      destroyOnHidden
      afterOpenChange={(opened) => {
        if (opened) {
          delayedFocus(tenancyNameRef);
        }
      }}
      footer={[
        <button
          key="cancel"
          type="button"
          className="btn btn-light-primary fw-bold"
          onClick={onClose}
          disabled={saving}
        >
          {L("Cancel")}
        </button>,
        <button
          key="save"
          type="button"
          className="btn btn-primary fw-bold d-inline-flex align-items-center"
          onClick={handleSubmit(onSubmit)}
          disabled={saving || !isValid}
        >
          {saving && (
            <span className="spinner-border spinner-border-sm me-2"></span>
          )}
          <i className="fa fa-save me-2 align-middle"></i>
          <span className="align-middle">{L("Save")}</span>
        </button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item className="mb-5" label={L("TenancyName")} required>
          <Controller
            name="tenancyName"
            control={control}
            rules={{ required: true, pattern: nameRegex }}
            render={({ field }) => (
              <input {...field} className="form-control" ref={tenancyNameRef} />
            )}
          />
        </Form.Item>
        <Form.Item className="mb-5" label={L("Name")} required>
          <Controller
            name="name"
            control={control}
            rules={{ required: true, pattern: nameRegex }}
            render={({ field }) => (
              <input {...field} className="form-control" />
            )}
          />
        </Form.Item>

        <div className="mb-5">
          <Controller
            name="useHostDb"
            control={control}
            render={({ field }) => (
              <label className="form-check form-check-custom form-check-solid py-1">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <span className="form-check-label">{L("UseHostDatabase")}</span>
              </label>
            )}
          />
        </div>

        {!useHostDb && (
          <Form.Item
            className="mb-5"
            label={L("DatabaseConnectionString")}
            required
          >
            <Controller
              name="connectionString"
              control={control}
              rules={{ required: !useHostDb }}
              render={({ field }) => (
                <input {...field} className="form-control" />
              )}
            />
          </Form.Item>
        )}

        <Form.Item className="mb-5" label={L("AdminName")} required>
          <Controller
            name="adminName"
            control={control}
            rules={{ required: true, pattern: nameRegex }}
            render={({ field }) => (
              <input {...field} className="form-control" />
            )}
          />
        </Form.Item>
        <Form.Item className="mb-5" label={L("AdminSurname")} required>
          <Controller
            name="adminSurname"
            control={control}
            rules={{ required: true, pattern: nameRegex }}
            render={({ field }) => (
              <input {...field} className="form-control" />
            )}
          />
        </Form.Item>
        <Form.Item className="mb-5" label={L("AdminEmailAddress")} required>
          <Controller
            name="adminEmailAddress"
            control={control}
            rules={{
              required: true,
              pattern: /\w+([-.+]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/,
            }}
            render={({ field }) => (
              <input type="email" {...field} className="form-control" />
            )}
          />
        </Form.Item>

        <div className="mb-5">
          <Controller
            name="setRandomPassword"
            control={control}
            render={({ field }) => (
              <label className="form-check form-check-custom form-check-solid py-1">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <span className="form-check-label">
                  {L("SetRandomPassword")}
                </span>
              </label>
            )}
          />
        </div>

        {!setRandomPassword && (
          <>
            <Form.Item className="mb-5" label={L("AdminPassword")} required>
              <Controller
                name="adminPassword"
                control={control}
                rules={{
                  required: !setRandomPassword,
                  validate: validatePassword,
                }}
                render={({ field }) => (
                  <div className="position-relative">
                    <input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      autoComplete="new-password"
                      maxLength={32}
                    />
                    <button
                      type="button"
                      aria-pressed={showPassword}
                      aria-label={
                        showPassword ? L("HidePassword") : L("ShowPassword")
                      }
                      onClick={() => setShowPassword((s) => !s)}
                      className="btn btn-sm btn-icon position-absolute translate-middle top-50 end-0 me-n2"
                      style={{ transform: "translateY(-50%)" }}
                    >
                      <i
                        className={`fas ${
                          showPassword ? "fa-eye" : "fa-eye-slash"
                        } fs-4`}
                      />
                    </button>
                  </div>
                )}
              />
              {inlinePasswordErrors.length > 0 && (
                <ul
                  className="help-block text-danger ms-4 mt-2"
                  style={{ fontSize: 12 }}
                >
                  {inlinePasswordErrors.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              )}
            </Form.Item>
            <Form.Item
              className="mb-5"
              label={L("AdminPasswordRepeat")}
              required
            >
              <Controller
                name="adminPasswordRepeat"
                control={control}
                rules={{
                  required: !setRandomPassword,
                  validate: (v) =>
                    v === getValues("adminPassword") || L("PasswordsDontMatch"),
                }}
                render={({ field }) => (
                  <div className="position-relative">
                    <input
                      {...field}
                      type={showPasswordRepeat ? "text" : "password"}
                      className="form-control"
                      autoComplete="new-password"
                      maxLength={32}
                    />
                    <button
                      type="button"
                      aria-pressed={showPasswordRepeat}
                      aria-label={
                        showPasswordRepeat
                          ? L("HidePassword")
                          : L("ShowPassword")
                      }
                      onClick={() => setShowPasswordRepeat((s) => !s)}
                      className="btn btn-sm btn-icon position-absolute translate-middle top-50 end-0 me-n2"
                      style={{ transform: "translateY(-50%)" }}
                    >
                      <i
                        className={`fas ${
                          showPasswordRepeat ? "fa-eye" : "fa-eye-slash"
                        } fs-4`}
                      />
                    </button>
                  </div>
                )}
              />
              {passwordsMismatch && (
                <div
                  className="form-text text-danger ms-4 mt-2"
                  style={{ fontSize: 12 }}
                >
                  {L("PasswordsDontMatch")}
                </div>
              )}
            </Form.Item>
          </>
        )}

        <Form.Item className="mb-5" label={L("Edition")}>
          <Controller
            name="editionId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                onChange={(v) => {
                  field.onChange(v);
                  onEditionChange(v);
                }}
                options={editionOptions}
              />
            )}
          />
        </Form.Item>

        {isSubscriptionFieldsVisible && (
          <>
            <div className="mb-5">
              <Controller
                name="isUnlimited"
                control={control}
                render={({ field }) => (
                  <label className="form-check form-check-custom form-check-solid py-1">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        onUnlimitedChange(e.target.checked);
                      }}
                    />
                    <span className="form-check-label">
                      {L("UnlimitedTimeSubscription")}
                    </span>
                  </label>
                )}
              />
            </div>

            {!isUnlimited && (
              <Form.Item
                className="mb-5"
                label={L("SubscriptionEndDateUtc")}
                required
              >
                <Controller
                  name="subscriptionEndDateUtc"
                  control={control}
                  rules={{ required: !isUnlimited }}
                  render={({ field }) => (
                    <DatePicker
                      className="form-control mb-5"
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                    />
                  )}
                />
              </Form.Item>
            )}

            {!isUnlimited && !isSelectedEditionFree && (
              <div className="mb-5">
                <Controller
                  name="isInTrialPeriod"
                  control={control}
                  render={({ field }) => (
                    <label className="form-check form-check-custom form-check-solid py-1">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        disabled={isSelectedEditionFree}
                      />
                      <span className="form-check-label">
                        {L("IsInTrialPeriod")}
                      </span>
                    </label>
                  )}
                />
              </div>
            )}
          </>
        )}

        <div className="mb-5">
          <Controller
            name="shouldChangePasswordOnNextLogin"
            control={control}
            render={({ field }) => (
              <label className="form-check form-check-custom form-check-solid py-1">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <span className="form-check-label">
                  {L("ShouldChangePasswordOnNextLogin")}
                </span>
              </label>
            )}
          />
        </div>
        <div className="mb-5">
          <Controller
            name="sendActivationEmail"
            control={control}
            render={({ field }) => (
              <label className="form-check form-check-custom form-check-solid py-1">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <span className="form-check-label">
                  {L("SendActivationEmail")}
                </span>
              </label>
            )}
          />
        </div>
        <div className="mb-5">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <label className="form-check form-check-custom form-check-solid py-1">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <span className="form-check-label">{L("Active")}</span>
              </label>
            )}
          />
        </div>
      </Form>
    </Modal>
  );
};

export default CreateTenantModal;
