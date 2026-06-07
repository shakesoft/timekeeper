import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import { useForm } from "react-hook-form";
import {
  OrganizationUnitServiceProxy,
  CreateOrganizationUnitInput,
  UpdateOrganizationUnitInput,
  OrganizationUnitDto,
} from "@api/generated/service-proxies";
import type { IBasicOrganizationUnitInfo } from "../types";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSave: (unit: OrganizationUnitDto) => void;
  organizationUnit?: IBasicOrganizationUnitInfo;
}

const CreateOrEditUnitModal: React.FC<Props> = ({
  isVisible,
  onClose,
  onSave,
  organizationUnit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isValid },
  } = useForm<{ displayName: string }>();
  const [saving, setSaving] = useState(false);
  const organizationUnitService = useServiceProxy(
    OrganizationUnitServiceProxy,
    [],
  );

  useEffect(() => {
    if (isVisible) {
      reset({ displayName: organizationUnit?.displayName || "" });
    }
  }, [isVisible, organizationUnit, reset]);

  const onSubmit = async (values: { displayName: string }) => {
    setSaving(true);
    try {
      if (organizationUnit?.id) {
        const input = new UpdateOrganizationUnitInput({
          id: organizationUnit.id,
          displayName: values.displayName,
        });
        const result =
          await organizationUnitService.updateOrganizationUnit(input);
        onSave(result);
      } else {
        const input = new CreateOrganizationUnitInput({
          parentId: organizationUnit?.parentId,
          displayName: values.displayName,
        });
        const result =
          await organizationUnitService.createOrganizationUnit(input);
        onSave(result);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={
        organizationUnit?.id
          ? `${L("Edit")}: ${organizationUnit.displayName}`
          : L("NewOrganizationUnit")
      }
      open={isVisible}
      onCancel={onClose}
      afterOpenChange={(opened) => {
        if (opened) {
          setTimeout(() => setFocus("displayName"), 0);
        }
      }}
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
          className="btn btn-primary fw-bold"
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || saving}
        >
          <i className="fa fa-save"></i> <span>{L("Save")}</span>
        </button>,
      ]}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-5 form-md-line-input form-md-floating-label no-hint">
          <label
            className="form-label required"
            htmlFor="OrganizationUnitDisplayName"
          >
            {L("Name")}
          </label>
          <input
            id="OrganizationUnitDisplayName"
            type="text"
            className={`form-control ${errors.displayName ? "is-invalid" : ""}`}
            {...register("displayName", { required: true, maxLength: 128 })}
            maxLength={128}
          />
          {errors.displayName && (
            <div className="invalid-feedback">{L("ThisFieldIsRequired")}</div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default CreateOrEditUnitModal;
