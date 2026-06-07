import React, { useState, useEffect } from "react";
import { Modal, Select } from "antd";

import { useForm, Controller } from "react-hook-form";
import {
  DynamicEntityPropertyServiceProxy,
  DynamicPropertyServiceProxy,
  type DynamicEntityPropertyDto,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  entityFullName?: string;
}

const CreateEntityPropertyModal: React.FC<Props> = ({
  isVisible,
  onClose,
  onSave,
  entityFullName,
}) => {
  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<DynamicEntityPropertyDto>({ mode: "onChange" });
  const [saving, setSaving] = useState(false);
  const [availableProperties, setAvailableProperties] = useState<
    { label: string; value: number }[]
  >([]);

  const dynamicEntityPropertyService = useServiceProxy(
    DynamicEntityPropertyServiceProxy,
    [],
  );
  const dynamicPropertyService = useServiceProxy(
    DynamicPropertyServiceProxy,
    [],
  );

  useEffect(() => {
    if (!isVisible || !entityFullName) return;

    Promise.all([
      dynamicPropertyService.getAll(),
      dynamicEntityPropertyService.getAllPropertiesOfAnEntity(entityFullName),
    ]).then(([allProps, definedProps]) => {
      const definedIds = (definedProps.items ?? []).map(
        (p) => p.dynamicPropertyId,
      );
      const available = (allProps.items ?? [])
        .filter((p) => !definedIds.includes(p.id))
        .map((p) => ({ label: p.propertyName!, value: p.id! }));
      setAvailableProperties(available);
    });
  }, [
    isVisible,
    entityFullName,
    dynamicPropertyService,
    dynamicEntityPropertyService,
  ]);

  const onSubmit = async (values: DynamicEntityPropertyDto) => {
    setSaving(true);
    try {
      values.entityFullName = entityFullName;
      await dynamicEntityPropertyService.add(values);
      onSave();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={L("AddNewDynamicEntityProperty")}
      open={isVisible}
      onCancel={onClose}
      footer={[
        <button
          key="cancel"
          type="button"
          className="btn btn-light-primary fw-bold mt-3"
          onClick={onClose}
          disabled={saving}
        >
          {L("Cancel")}
        </button>,
        <button
          key="save"
          type="button"
          className="btn btn-primary fw-bold d-inline-flex align-items-center mt-3"
          onClick={handleSubmit(onSubmit)}
          disabled={saving || !isValid}
        >
          {saving && (
            <span className="spinner-border spinner-border-sm me-2"></span>
          )}
          <i className="fa fa-save me-2 align-middle"></i>
          <span className="align-middle">{L("Save")}</span>
        </button>,
      ]}
    >
      <div className="form">
        <div className="mb-5">
          <label
            className="form-label required"
            htmlFor="DynamicEntityProperty"
          >
            {L("Parameter")}
          </label>
          <Controller
            name="dynamicPropertyId"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                id="DynamicEntityProperty"
                className={`form-select mb-1 ${
                  errors.dynamicPropertyId ? "is-invalid" : ""
                }`}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={availableProperties}
                placeholder={L("SelectADynamicProperty")}
              />
            )}
          />
          {errors.dynamicPropertyId && (
            <div className="invalid-feedback d-block">
              {L("ThisFieldIsRequired")}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CreateEntityPropertyModal;
