import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Modal } from "antd";
import {
  ProfileServiceProxy,
  UpdateGoogleAuthenticatorKeyOutput,
  VerifyAuthenticatorCodeInput,
} from "@api/generated/service-proxies";
import RecoveryCodes from "./RecoveryCodes";
import VerifyCodeModal, { VerifyCodeModalHandle } from "./VerifyCodeModal";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

export type ViewRecoveryCodesModalHandle = { show: () => void };

const ViewRecoveryCodesModal = forwardRef<ViewRecoveryCodesModalHandle>(
  (_props, ref) => {
    const profileService = useServiceProxy(ProfileServiceProxy, []);
    const verifyRef = useRef<VerifyCodeModalHandle>(null);
    const [visible, setVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [codes, setCodes] = useState<string[]>([]);

    useImperativeHandle(ref, () => ({ show: () => verifyRef.current?.show() }));

    const onVerified = async (input: VerifyAuthenticatorCodeInput) => {
      setSaving(true);
      try {
        const result: UpdateGoogleAuthenticatorKeyOutput =
          await profileService.viewRecoveryCodes(input);
        setCodes(result.recoveryCodes || []);
        setVisible(true);
      } finally {
        setSaving(false);
      }
    };

    return (
      <>
        <VerifyCodeModal ref={verifyRef} onVerified={onVerified} />
        <Modal
          title={L("ViewRecoveryCodes")}
          open={visible}
          onCancel={() => setVisible(false)}
          footer={null}
          confirmLoading={saving}
          destroyOnHidden
        >
          <div className="card">
            <div className="card-body pt-0">
              <RecoveryCodes codes={codes} />
            </div>
          </div>
        </Modal>
      </>
    );
  },
);

export default ViewRecoveryCodesModal;
