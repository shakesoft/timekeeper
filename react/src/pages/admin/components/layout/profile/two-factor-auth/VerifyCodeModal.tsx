import { forwardRef, useImperativeHandle, useState, useRef } from "react";
import { Modal } from "antd";
import {
  ProfileServiceProxy,
  VerifyAuthenticatorCodeInput,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

export type VerifyCodeModalHandle = { show: () => void };

const VerifyCodeModal = forwardRef<
  VerifyCodeModalHandle,
  { onVerified?: (input: VerifyAuthenticatorCodeInput) => void }
>((props, ref) => {
  const profileService = useServiceProxy(ProfileServiceProxy, []);
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [code, setCode] = useState("");
  const codeInputRef = useRef<HTMLInputElement>(null);
  const delayedFocus = useDelayedFocus();

  useImperativeHandle(ref, () => ({
    show: () => {
      setCode("");
      setVisible(true);
    },
  }));

  const handleVerify = async () => {
    const trimmed = (code || "").trim();
    if (trimmed.length < 6) return;
    const input = new VerifyAuthenticatorCodeInput();
    input.code = trimmed;
    setSaving(true);
    try {
      const result = await profileService.verifyAuthenticatorCode(input);
      if (result) {
        setVisible(false);
        props.onVerified?.(input);
      }
    } finally {
      setSaving(false);
    }
  };

  const isValid = (code || "").trim().length >= 6;

  return (
    <Modal
      title={L("YourAuthenticatorCode")}
      open={visible}
      onCancel={() => setVisible(false)}
      afterOpenChange={(opened) => {
        if (opened) {
          delayedFocus(codeInputRef);
        }
      }}
      footer={[
        <button
          key="verify"
          type="button"
          className="btn btn-primary"
          disabled={!isValid || saving}
          onClick={() => void handleVerify()}
        >
          {L("Verify")}
        </button>,
      ]}
      destroyOnHidden
    >
      <div className="mb-5">
        <label className="form-label required" htmlFor="YourCode">
          {L("YourCode")}
        </label>
        <input
          id="YourCode"
          className="form-control"
          type="text"
          value={code}
          maxLength={6}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleVerify();
          }}
          ref={codeInputRef}
        />
      </div>
    </Modal>
  );
});

export default VerifyCodeModal;
