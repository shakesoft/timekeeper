import React, { useEffect, useRef, useState } from "react";
import { Modal, Spin } from "antd";
import {
  EntityDtoOfInt64,
  GetUserPermissionsForEditOutput,
  UpdateUserPermissionsInput,
  UserServiceProxy,
} from "@api/generated/service-proxies";
import PermissionTree, {
  type PermissionTreeRef,
} from "../../components/common/trees/PermissionTree";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

interface Props {
  visible: boolean;
  onClose: () => void;
  userId?: number;
  userName?: string;
}

const EditUserPermissionsModal: React.FC<Props> = ({
  visible,
  onClose,
  userId,
  userName,
}) => {
  const userService = useServiceProxy(UserServiceProxy, []);
  const treeRef = useRef<PermissionTreeRef>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GetUserPermissionsForEditOutput | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!visible || !userId) return;
    setLoading(true);
    userService
      .getUserPermissionsForEdit(userId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [visible, userId, userService]);

  const handleSave = async () => {
    if (!userId) return;
    const input = new UpdateUserPermissionsInput();
    input.id = userId;
    input.grantedPermissionNames =
      treeRef.current?.getGrantedPermissionNames() || [];
    setSaving(true);
    try {
      await userService.updateUserPermissions(input);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const resetPermissions = async () => {
    if (!userId) return;
    const dto = new EntityDtoOfInt64();
    dto.id = userId;
    setResetting(true);
    try {
      await userService.resetUserSpecificPermissions(dto);
      const result = await userService.getUserPermissionsForEdit(userId);
      setData(result);
    } finally {
      setResetting(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={
        <span>
          {L("Permissions")}
          {userName && <span> - {userName}</span>}
        </span>
      }
      width={800}
      footer={[
        <button
          key="reset"
          type="button"
          className="btn btn-secondary float-start"
          onClick={resetPermissions}
          disabled={saving || resetting}
          title={L("ResetPermissionsTooltip")!}
        >
          {resetting ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {L("SavingWithThreeDot")}
            </>
          ) : (
            <span>{L("ResetSpecialPermissions")}</span>
          )}
        </button>,
        <button
          key="cancel"
          type="button"
          className="btn btn-light-primary fw-bold"
          onClick={onClose}
          disabled={saving || resetting}
        >
          {L("Cancel")}
        </button>,
        <button
          key="save"
          type="submit"
          className="btn btn-primary fw-bold d-inline-flex align-items-center"
          onClick={handleSave}
          disabled={saving || resetting}
        >
          {saving ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {L("SavingWithThreeDot")}
            </>
          ) : (
            <>
              <i className="fa fa-save align-middle me-2"></i>
              <span className="align-middle">{L("Save")}</span>
            </>
          )}
        </button>,
      ]}
    >
      <Spin spinning={loading}>
        {data && (
          <>
            <PermissionTree
              ref={treeRef}
              permissions={data.permissions || []}
              grantedPermissionNames={data.grantedPermissionNames || []}
              showControls={true}
              maxHeight="400px"
            />
            <div
              className="alert alert-warning"
              style={{ marginBottom: 0, marginTop: "15px" }}
            >
              <em>{L("Note_RefreshPageForPermissionChanges")}</em>
            </div>
          </>
        )}
      </Spin>
    </Modal>
  );
};

export default EditUserPermissionsModal;
