import React from "react";
import { Modal, Progress, theme } from "antd";
import { useSessionTimeout } from "./useSessionTimeout";
import L from "@/lib/L";

const SessionTimeoutModal: React.FC = () => {
  const { isEnabled, isOpen, secondsRemaining, progressPercent, close } =
    useSessionTimeout();
  const { token } = theme.useToken();

  if (!isEnabled) {
    return null;
  }

  return (
    <Modal
      open={isOpen}
      title={L("YourSessionIsAboutToExpire")}
      onCancel={close}
      footer={null}
      mask={{ closable: false }}
      closable
      destroyOnHidden
    >
      <p>
        {L("SessionExpireRedirectingInXSecond", {
          0: secondsRemaining,
          seconds: secondsRemaining,
        })}
      </p>

      <div className="bg-light-primary rounded p-2">
        <Progress
          percent={Math.round(progressPercent)}
          showInfo
          format={() => `${secondsRemaining}`}
          status="active"
          strokeColor={token.colorPrimary}
        />
      </div>
    </Modal>
  );
};

export default SessionTimeoutModal;
