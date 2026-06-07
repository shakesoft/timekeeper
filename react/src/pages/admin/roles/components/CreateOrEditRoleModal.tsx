import React, { useState, useEffect, useRef } from "react";
import { Modal, Tabs } from "antd";
import type { TabsProps } from "antd";
import { useForm } from "react-hook-form";
import {
  RoleServiceProxy,
  CreateOrUpdateRoleInput,
  RoleEditDto,
  GetRoleForEditOutput,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@api/service-proxy-factory";
import PermissionTree, {
  type PermissionTreeRef,
} from "../../components/common/trees/PermissionTree";
import L from "@/lib/L";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  roleId?: number;
}

const CreateOrEditRoleModal: React.FC<Props> = ({
  isVisible,
  onSave,
  onClose,
  roleId,
}) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isValid },
  } = useForm<RoleEditDto>({ mode: "onChange" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissionData, setPermissionData] =
    useState<GetRoleForEditOutput | null>(null);
  const permissionTreeRef = useRef<PermissionTreeRef>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<string>("properties");
  const delayedFocus = useDelayedFocus();

  const roleService = useServiceProxy(RoleServiceProxy, []);

  useEffect(() => {
    if (!isVisible) {
      setActiveTab("properties");
      return;
    }

    setLoading(true);
    roleService.getRoleForEdit(roleId).then((result: GetRoleForEditOutput) => {
      setPermissionData(result);
      reset(result.role);
      setLoading(false);
    });
  }, [isVisible, roleId, roleService, reset]);

  const onSubmit = async (values: RoleEditDto) => {
    setSaving(true);
    try {
      const input = new CreateOrUpdateRoleInput();
      input.role = values;
      input.grantedPermissionNames =
        permissionTreeRef.current?.getGrantedPermissionNames() ?? [];

      await roleService.createOrUpdateRole(input);
      onSave();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const tabItems: TabsProps["items"] = [
    {
      key: "properties",
      label: L("RoleProperties"),
      children: (
        <div>
          <div className="mb-5 form-md-line-input form-md-floating-label no-hint">
            <label className="form-label required" htmlFor="RoleDisplayName">
              {L("RoleName")}
            </label>
            {(() => {
              const { ref: displayNameRef, ...displayNameRegister } = register(
                "displayName",
                { required: true, maxLength: 128 },
              );

              return (
                <input
                  id="RoleDisplayName"
                  type="text"
                  className={`form-control ${
                    errors.displayName ? "is-invalid" : ""
                  }`}
                  disabled={loading}
                  {...displayNameRegister}
                  ref={(el) => {
                    displayNameRef(el);
                    firstInputRef.current = el;
                  }}
                  maxLength={128}
                />
              );
            })()}
            {errors.displayName && (
              <div className="invalid-feedback">{L("ThisFieldIsRequired")}</div>
            )}
          </div>
          <div className="mb-5">
            <div className="form-check form-check-custom form-check-solid">
              <input
                className="form-check-input"
                type="checkbox"
                id="RoleIsDefault"
                disabled={loading}
                {...register("isDefault")}
              />
              <label className="form-check-label" htmlFor="RoleIsDefault">
                {L("Default")}
              </label>
            </div>
            <small className="form-text text-muted">
              ({L("DefaultRole_Description")})
            </small>
          </div>
        </div>
      ),
    },
    {
      key: "permissions",
      label: L("Permissions"),
      children: (
        <div>
          {permissionData && (
            <PermissionTree
              ref={permissionTreeRef}
              permissions={permissionData.permissions ?? []}
              grantedPermissionNames={
                permissionData.grantedPermissionNames ?? []
              }
              showControls={true}
              maxHeight="400px"
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={
        roleId
          ? `${L("EditRole")}: ${permissionData?.role.displayName}`
          : L("CreateNewRole")
      }
      open={isVisible}
      onCancel={onClose}
      afterOpenChange={(open) => {
        if (open) {
          delayedFocus(firstInputRef);
        }
      }}
      width={800}
      footer={[
        <button
          key="cancel"
          type="button"
          className="btn btn-light-primary fw-bold"
          onClick={onClose}
          disabled={saving}
        >
          {L("Cancel")}
        </button>,
        <button
          key="save"
          type="submit"
          className="btn btn-primary fw-bold d-inline-flex align-items-center"
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || saving}
        >
          <i className="fa fa-save align-middle me-2"></i>
          <span className="align-middle">{L("Save")}</span>
        </button>,
      ]}
    >
      <div className="form" aria-disabled={loading}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            if (key === "permissions") {
              permissionTreeRef.current?.expandAll();
            }
          }}
          items={tabItems}
        />
      </div>
    </Modal>
  );
};

export default CreateOrEditRoleModal;
