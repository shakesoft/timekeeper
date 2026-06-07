import React, { useState, useRef } from "react";
import { Modal } from "antd";
import {
  CreateFriendshipWithDifferentTenantInput,
  FriendshipServiceProxy,
  useServiceProxy,
} from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useChatContext } from "./hooks/useChatContext";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

type Props = {
  open: boolean;
  onClose: () => void;
};

const AddFriendTenantModal: React.FC<Props> = ({ open, onClose }) => {
  const friendshipService = useServiceProxy(FriendshipServiceProxy, []);
  const { reload } = useChatContext();
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState("");
  const [tenancyName, setTenancyName] = useState("");
  const firstInputRef = useRef<HTMLInputElement>(null);
  const delayedFocus = useDelayedFocus();

  const reset = () => {
    setUserName("");
    setTenancyName("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const input = new CreateFriendshipWithDifferentTenantInput();
      input.tenancyName = tenancyName;
      input.userName = userName;
      await friendshipService.createFriendshipWithDifferentTenant(input);
      abp.notify?.info?.(L("FriendshipRequestAccepted"));
      await reload();
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={L("AddFriendFromDifferentTenant")}
      open={open}
      onCancel={handleClose}
      width={600}
      afterOpenChange={(opened) => {
        if (opened) {
          delayedFocus(firstInputRef);
        }
      }}
      footer={
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-light-primary fw-bold"
            onClick={handleClose}
          >
            {L("Cancel")}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={saving || !userName || !tenancyName}
            onClick={handleSave}
          >
            <i className="fa fa-save" /> <span>{L("Save")}</span>
          </button>
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (userName && tenancyName) handleSave();
        }}
      >
        <div className="row mb-3">
          <label className="col-4 form-label">{L("TenancyName")}</label>
          <div className="col">
            <input
              className="form-control"
              type="text"
              id="TenancyName"
              name="TenancyName"
              value={tenancyName}
              onChange={(e) => setTenancyName(e.target.value)}
              required
              ref={firstInputRef}
            />
          </div>
        </div>
        <div className="row mb-3">
          <label className="col-4 form-label">{L("UserName")}</label>
          <div className="col">
            <input
              className="form-control"
              type="text"
              id="UserName"
              name="UserName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddFriendTenantModal;
