import React, { useMemo, useState } from "react";
import { Modal } from "antd";
import FriendsLookupTable from "./FriendsLookupTable";
import AddFriendTenantModal from "./AddFriendTenantModal.tsx";
import {
  CreateFriendshipForCurrentTenantInput,
  CreateFriendshipRequestInput,
  FindUsersOutputDto,
  FriendshipServiceProxy,
  useServiceProxy,
} from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { usePermissions } from "@/hooks/usePermissions";
import { useChatContext } from "./hooks/useChatContext.ts";

type Props = {
  open: boolean;
  onClose: () => void;
};

const AddFriendModal: React.FC<Props> = ({ open, onClose }) => {
  const friendshipService = useServiceProxy(FriendshipServiceProxy, []);
  const { isGranted } = usePermissions();
  const { reload } = useChatContext();
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState("");
  const [isTenantModalOpen, setTenantModalOpen] = useState(false);

  const interTenantChatAllowed = useMemo(() => {
    const toTenant = abp.features?.isEnabled?.(
      "App.ChatFeature.TenantToTenant",
    );
    const toHost = abp.features?.isEnabled?.("App.ChatFeature.TenantToHost");
    const noTenant = !abp.session?.tenantId;
    return !!(toTenant || toHost || noTenant);
  }, []);

  const canListUsersInTenant = isGranted("Pages.Administration.Users");

  const handleSelect = async (item: FindUsersOutputDto) => {
    const input = new CreateFriendshipRequestInput();
    input.userId = item.id;
    input.tenantId = abp.session?.tenantId ?? undefined;
    setSaving(true);
    try {
      await friendshipService.createFriendshipRequest(input);
      abp.notify?.info?.(L("FriendshipRequestAccepted"));
      await reload();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const input = new CreateFriendshipForCurrentTenantInput();
      input.userName = userName;
      await friendshipService.createFriendshipForCurrentTenant(input);
      abp.notify?.info?.(L("FriendshipRequestAccepted"));
      await reload();
      onClose();
    } finally {
      setSaving(false);
      setUserName("");
    }
  };

  const handleClose = () => {
    setUserName("");
    onClose();
  };

  const renderCurrentTenantForm = () => (
    <form
      className="mt-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (userName) handleSave();
      }}
    >
      <div className="row">
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
      <div className="d-flex justify-content-end gap-2 mt-4">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving || !userName}
        >
          <i className="fa fa-save"></i>
          <span>{L("Save")}</span>
        </button>
      </div>
    </form>
  );

  return (
    <>
      <Modal
        title={L("AddFriend")}
        open={open}
        onCancel={handleClose}
        width={600}
        footer={
          <button
            type="button"
            className="btn btn-light-primary fw-bold"
            onClick={handleClose}
          >
            {L("Cancel")}
          </button>
        }
      >
        {interTenantChatAllowed && (
          <div className="row text-end mb-3">
            <div className="col">
              <button
                className="btn btn-primary"
                onClick={() => setTenantModalOpen(true)}
              >
                {L("AddFriendFromDifferentTenant")}
              </button>
            </div>
          </div>
        )}

        {canListUsersInTenant ? (
          <FriendsLookupTable onSelect={handleSelect} />
        ) : (
          renderCurrentTenantForm()
        )}
      </Modal>
      <AddFriendTenantModal
        open={isTenantModalOpen}
        onClose={() => setTenantModalOpen(false)}
      />
    </>
  );
};

export default AddFriendModal;
