import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";
import { Modal } from "antd";
import {
  ChangePasswordInput,
  GetPasswordComplexitySettingOutput,
  PasswordComplexitySetting,
  ProfileServiceProxy,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { getPasswordComplexityErrors } from "@/lib/password-complexity";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

export type ChangePasswordModalHandle = { show: () => void };

type PasswordFieldProps = {
  id: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
  required?: boolean;
};

const PasswordField = ({
  id,
  name,
  value,
  onChange,
  inputRef,
  required,
}: PasswordFieldProps) => {
  const [show, setShow] = useState(false);
  return (
    <div className="position-relative mb-3">
      <input
        id={id}
        ref={inputRef || undefined}
        type={show ? "text" : "password"}
        name={name}
        className="form-control"
        value={value}
        onChange={onChange}
        required={!!required}
      />
      <span
        className="btn btn-sm btn-icon position-absolute translate-middle top-50 end-0 me-n2"
        role="button"
        aria-label={L("TogglePasswordVisibility")}
        aria-pressed={show}
        onClick={() => setShow((s) => !s)}
      >
        <i
          className={
            !show ? "fas fa-eye-slash fs-4" : "fas fa-eye-slash fs-4 d-none"
          }
        />
        <i className={show ? "fas fa-eye fs-4" : "fas fa-eye fs-4 d-none"} />
      </span>
    </div>
  );
};

const ChangePasswordModal = forwardRef<ChangePasswordModalHandle>(
  (_props, ref) => {
    const profileService = useServiceProxy(ProfileServiceProxy, []);
    const delayedFocus = useDelayedFocus();
    const currentPasswordInputRef = useRef<HTMLInputElement | null>(null);

    const [active, setActive] = useState(false);
    const [saving, setSaving] = useState(false);
    const [complexity, setComplexity] =
      useState<PasswordComplexitySetting | null>(null);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");

    const formDirty = !!(currentPassword || newPassword || repeatPassword);

    const complexityErrorsNew = getPasswordComplexityErrors(
      newPassword,
      complexity,
    );
    const complexityErrorsRepeat = getPasswordComplexityErrors(
      repeatPassword,
      complexity,
    );
    const passwordsMatch = newPassword === repeatPassword;

    const isValid =
      !!currentPassword &&
      !!newPassword &&
      passwordsMatch &&
      complexityErrorsNew.length === 0 &&
      complexityErrorsRepeat.length === 0;

    const onShown = useCallback(() => {
      delayedFocus(currentPasswordInputRef);
    }, [delayedFocus]);

    const loadAndShow = useCallback(async () => {
      const result: GetPasswordComplexitySettingOutput =
        await profileService.getPasswordComplexitySetting();
      setComplexity(result.setting);
      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");
      setActive(true);
    }, [profileService]);

    useImperativeHandle(ref, () => ({
      show: () => {
        void loadAndShow();
      },
    }));

    const close = useCallback(() => {
      setActive(false);
    }, []);

    const handleSave = useCallback(async () => {
      if (!isValid) return;
      const input = new ChangePasswordInput();
      input.currentPassword = currentPassword;
      input.newPassword = newPassword;
      setSaving(true);
      try {
        await profileService.changePassword(input);
        abp?.notify?.info?.(L("YourPasswordHasChangedSuccessfully"));
        close();
      } finally {
        setSaving(false);
      }
    }, [close, currentPassword, isValid, newPassword, profileService]);

    return (
      <Modal
        title={L("ChangePassword")}
        open={active}
        onCancel={close}
        width={600}
        mask={{ closable: false }}
        afterOpenChange={(opened) => {
          if (opened) onShown();
        }}
        footer={
          <div className="d-flex justify-content-end gap-3">
            <button
              type="button"
              className="btn btn-light-primary fw-bold"
              onClick={close}
              disabled={saving}
            >
              {L("Cancel")}
            </button>
            <button
              type="button"
              className="btn btn-primary fw-bold"
              onClick={() => void handleSave()}
              disabled={!isValid || saving}
            >
              <i className="fa fa-save" />
              <span className="ms-2">{L("Save")}</span>
            </button>
          </div>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSave();
          }}
        >
          <div className="mb-5" data-kt-password-meter="true">
            <label className="form-label" htmlFor="CurrentPassword">
              {L("CurrentPassword")}
            </label>
            <PasswordField
              id="CurrentPassword"
              name="CurrentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              inputRef={currentPasswordInputRef}
              required
            />
          </div>

          <div className="mb-5" data-kt-password-meter="true">
            <label className="form-label" htmlFor="NewPassword">
              {L("NewPassword")}
            </label>
            <PasswordField
              id="NewPassword"
              name="NewPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {!isValid && formDirty && (
            <div>
              {!!complexityErrorsNew.length && (
                <ul className="help-block text-danger">
                  {complexityErrorsNew.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mb-5" data-kt-password-meter="true">
            <label className="form-label" htmlFor="NewPasswordRepeat">
              {L("NewPasswordRepeat")}
            </label>
            <PasswordField
              id="NewPasswordRepeat"
              name="NewPasswordRepeat"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              required
            />
          </div>

          {!isValid && formDirty && (
            <div>
              {!!complexityErrorsRepeat.length && (
                <ul className="help-block text-danger">
                  {complexityErrorsRepeat.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              )}
              {!passwordsMatch && (
                <ul className="help-block text-danger">
                  <li>{L("PasswordsDontMatch")}</li>
                </ul>
              )}
            </div>
          )}
        </form>
      </Modal>
    );
  },
);

export default ChangePasswordModal;
