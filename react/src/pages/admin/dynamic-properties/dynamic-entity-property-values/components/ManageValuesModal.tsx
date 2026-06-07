import React, { useRef } from "react";
import { Modal } from "antd";
import type { DynamicPropertyValueManagerRef } from "./DynamicPropertyValueManager";
import DynamicPropertyValueManager from "./DynamicPropertyValueManager";
import L from "@/lib/L";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  entityFullName?: string;
  entityId?: string;
}

const ManageValuesModal: React.FC<Props> = ({
  isVisible,
  onClose,
  entityFullName,
  entityId,
}) => {
  const managerRef = useRef<DynamicPropertyValueManagerRef>(null);

  const handleSave = () => {
    managerRef.current?.saveAll();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="d-flex justify-content-between align-items-center mb-5 small">
          <div>
            <span className="fw-bold">{L("EntityFullName")}:</span>{" "}
            <span className="fw-normal">{entityFullName}</span>
          </div>
          <div>
            <span className="fw-bold">{L("EntityId")}:</span>{" "}
            <span className="fw-normal">{entityId}</span>
          </div>
        </div>
      }
      open={isVisible}
      onCancel={onClose}
      closable={false}
      width={800}
      footer={[
        <button
          key="cancel"
          type="button"
          className="btn btn-light-primary fw-bold"
          onClick={onClose}
        >
          {L("Cancel")}
        </button>,
        <button
          key="save"
          type="submit"
          className="btn btn-primary fw-bold"
          onClick={handleSave}
        >
          {L("Save")}
        </button>,
      ]}
    >
      {entityFullName && entityId && (
        <DynamicPropertyValueManager
          ref={managerRef}
          entityFullName={entityFullName}
          entityId={entityId}
        />
      )}
    </Modal>
  );
};

export default ManageValuesModal;
