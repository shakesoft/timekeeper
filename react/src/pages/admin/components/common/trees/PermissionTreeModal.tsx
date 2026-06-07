import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal, Spin } from "antd";
import {
  PermissionServiceProxy,
  FlatPermissionDto,
} from "@api/generated/service-proxies";
import PermissionTree, { type PermissionTreeRef } from "./PermissionTree";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSave: (selectedPermissions: string[]) => void;
  initialPermissions?: string[];
  dontAddOpenerButton?: boolean;
  disableCascade?: boolean;
}

const PermissionTreeModal: React.FC<Props> = ({
  isVisible,
  onClose,
  onSave,
  initialPermissions = [],
  dontAddOpenerButton = true,
  disableCascade = true,
}) => {
  const permissionService = useServiceProxy(PermissionServiceProxy, []);
  const permissionTreeRef = useRef<PermissionTreeRef>(null);

  const [loading, setLoading] = useState(false);
  const [allPermissions, setAllPermissions] = useState<FlatPermissionDto[]>([]);
  const [numberOfFilteredPermission, setNumberOfFilteredPermission] =
    useState(0);
  const [internalVisible, setInternalVisible] = useState(false);

  const loadAllPermissions = useCallback(() => {
    setLoading(true);
    permissionService
      .getAllPermissions()
      .then((result) => {
        setAllPermissions(result.items ?? []);
      })
      .finally(() => setLoading(false));
  }, [permissionService]);

  useEffect(() => {
    if (!dontAddOpenerButton) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadAllPermissions();
    }
  }, [dontAddOpenerButton, loadAllPermissions]);

  useEffect(() => {
    const visible = dontAddOpenerButton ? isVisible : internalVisible;
    if (visible && allPermissions.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadAllPermissions();
    }
  }, [
    isVisible,
    internalVisible,
    allPermissions.length,
    dontAddOpenerButton,
    loadAllPermissions,
  ]);

  const handleSave = () => {
    const selected =
      permissionTreeRef.current?.getGrantedPermissionNames() || [];
    setNumberOfFilteredPermission(selected.length);

    if (dontAddOpenerButton) {
      onClose();
    } else {
      setInternalVisible(false);
    }

    onSave(selected);
    abp.notify.success(L("XCountPermissionFiltered", selected.length));
  };

  const handleCancel = () => {
    if (dontAddOpenerButton) {
      onClose();
    } else {
      setInternalVisible(false);
    }
  };

  const visible = dontAddOpenerButton ? isVisible : internalVisible;

  return (
    <>
      {!dontAddOpenerButton && (
        <button
          className="btn btn-secondary w-100"
          onClick={() => setInternalVisible(true)}
        >
          {L("SelectPermissions")} ({numberOfFilteredPermission})
        </button>
      )}
      <Modal
        title={L("SelectPermissions")}
        open={visible}
        onCancel={handleCancel}
        width={800}
        footer={[
          <button
            key="select"
            type="button"
            className="btn btn-primary fw-bold"
            onClick={handleSave}
          >
            {L("Select")}
          </button>,
        ]}
      >
        <Spin spinning={loading}>
          <PermissionTree
            ref={permissionTreeRef}
            permissions={allPermissions}
            grantedPermissionNames={initialPermissions}
            disableCascade={disableCascade}
            showControls={true}
            maxHeight="400px"
          />
        </Spin>
      </Modal>
    </>
  );
};

export default PermissionTreeModal;
