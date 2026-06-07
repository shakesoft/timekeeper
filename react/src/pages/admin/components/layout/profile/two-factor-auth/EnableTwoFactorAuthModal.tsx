import { forwardRef, useImperativeHandle, useState } from "react";
import { Modal } from "antd";
import {
  GenerateGoogleAuthenticatorKeyOutput,
  ProfileServiceProxy,
  UpdateGoogleAuthenticatorKeyInput,
  UpdateGoogleAuthenticatorKeyOutput,
} from "@api/generated/service-proxies";
import RecoveryCodes from "./RecoveryCodes";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

export type EnableTwoFactorAuthModalHandle = { show: () => void };

interface EnableTwoFactorAuthModalProps {
  onEnabled?: () => void;
}

const EnableTwoFactorAuthModal = forwardRef<
  EnableTwoFactorAuthModalHandle,
  EnableTwoFactorAuthModalProps
>(({ onEnabled }, ref) => {
  const profileService = useServiceProxy(ProfileServiceProxy, []);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [model, setModel] =
    useState<GenerateGoogleAuthenticatorKeyOutput | null>(null);
  const [recovery, setRecovery] =
    useState<UpdateGoogleAuthenticatorKeyOutput | null>(null);
  const [code, setCode] = useState("");

  const show = async () => {
    setStep(1);
    setRecovery(null);
    setLoading(true);
    try {
      const m = await profileService.generateGoogleAuthenticatorKey();
      setModel(m);
      setVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({ show }));

  const submitCode = async () => {
    const c = (code || "").trim();
    if (c.length !== 6 || !model) return;
    setLoading(true);
    try {
      const input = new UpdateGoogleAuthenticatorKeyInput();
      input.authenticatorCode = c;
      input.googleAuthenticatorKey = model.googleAuthenticatorKey;
      const res = await profileService.updateGoogleAuthenticatorKey(input);
      setRecovery(res);
      setStep(2);
    } finally {
      setLoading(false);
      setCode("");
    }
  };

  return (
    <Modal
      title={L("TwoFactorAuthentication")}
      open={visible}
      onCancel={() => setVisible(false)}
      footer={null}
      width={700}
      destroyOnHidden
    >
      {step === 1 && model && (
        <div>
          <div className="text-center mb-4">
            <img src={model.qrCodeSetupImageUrl!} alt="qr" />
          </div>
          <div className="col-md-8 mx-auto">
            <div className="fw-bold text-center">
              {L("AuthenticatorAppScan")}
            </div>
            <small>{L("AuthenticatorAppScanHelp")}</small>
            <input
              value={code}
              maxLength={6}
              onChange={(e) => {
                setCode(e.target.value);
                if ((e.target.value || "").trim().length === 6)
                  void submitCode();
              }}
              className="form-control form-control-sm mt-5"
            />
            <div className="text-end mt-3">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={loading || (code || "").trim().length !== 6}
                onClick={() => void submitCode()}
              >
                {L("Continue")}
              </button>
            </div>
          </div>
        </div>
      )}
      {step === 2 && recovery && (
        <div className="card">
          <div className="card-body pt-0">
            <RecoveryCodes codes={recovery.recoveryCodes || []} />
            <div className="text-end mt-4">
              <button
                type="button"
                className="btn btn-primary btn-sm me-2"
                onClick={() => {
                  const text = (recovery.recoveryCodes || []).join("\r\n");
                  const a = document.createElement("a");
                  a.setAttribute(
                    "href",
                    "data:text/plain;charset=utf-8," + encodeURIComponent(text),
                  );
                  a.setAttribute("download", "recovery-codes.txt");
                  a.click();
                }}
              >
                {L("Download")}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    (recovery.recoveryCodes || []).join("\r\n"),
                  );
                }}
              >
                {L("Copy")}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm ms-2"
                onClick={() => setStep(3)}
              >
                {L("Continue")}
              </button>
            </div>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="alert alert-success" role="alert">
          <div className="text-center mb-3">
            <i className="bi bi-shield-check display-6 text-success" />
          </div>
          <h4 className="text-center">{L("AuthenticatorAppEnabled")}</h4>
          <div>{L("AuthenticatorAppEnabledHelp")}</div>
          <div className="text-end mt-4">
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={() => {
                setVisible(false);
                abp?.message?.success?.(L("TwoFactorAuthenticationEnabled"));
                onEnabled?.();
              }}
            >
              {L("Done")}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
});

export default EnableTwoFactorAuthModal;
