import { forwardRef, useImperativeHandle, useState, useRef } from "react";
import { Modal } from "antd";
import {
  ProfileServiceProxy,
  VerifySmsCodeInputDto,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

export type SmsVerificationModalHandle = {
  show: (phoneNumber: string) => void;
};

const SmsVerificationModal = forwardRef<
  SmsVerificationModalHandle,
  { onVerified?: () => void }
>((props, ref) => {
  const svc = useServiceProxy(ProfileServiceProxy, []);
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState<string>("");
  const [code, setCode] = useState("");
  const codeInputRef = useRef<HTMLInputElement>(null);
  const delayedFocus = useDelayedFocus();

  const show = (pn: string) => {
    setPhone(pn);
    setCode("");
    setVisible(true);
  };
  useImperativeHandle(ref, () => ({ show }));

  const handleVerify = async () => {
    const trimmed = (code || "").trim();
    if (trimmed.length !== 6) return;
    const input = new VerifySmsCodeInputDto();
    input.code = trimmed;
    input.phoneNumber = phone;
    setSaving(true);
    try {
      await svc.verifySmsCode(input);
      setVisible(false);
      props.onVerified?.();
    } finally {
      setSaving(false);
    }
  };

  const isValid = (code || "").trim().length === 6;

  return (
    <Modal
      title={L("VerifyYourCode")}
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
        <label className="form-label required" htmlFor="YourSmsCode">
          {L("YourCode")}
        </label>
        <input
          id="YourSmsCode"
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

export default SmsVerificationModal;
