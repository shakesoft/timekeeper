import React, { useState, useEffect } from "react";
import { Modal, Select } from "antd";
import { useForm, Controller } from "react-hook-form";
import {
  DynamicEntityPropertyDefinitionServiceProxy,
  DynamicEntityPropertyServiceProxy,
  useServiceProxy,
} from "../../../../api/service-proxy-factory";
import L from "@/lib/L";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSave: (entityFullName: string) => void;
}

const SelectAnEntityModal: React.FC<Props> = ({
  isVisible,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [allEntities, setAllEntities] = useState<string[]>([]);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid },
  } = useForm<{ entityFullName?: string }>({ mode: "onChange" });

  const dynamicEntityPropertyService = useServiceProxy(
    DynamicEntityPropertyServiceProxy,
    [],
  );
  const dynamicEntityPropertyDefinitionService = useServiceProxy(
    DynamicEntityPropertyDefinitionServiceProxy,
    [],
  );

  useEffect(() => {
    if (!isVisible) {
      reset({ entityFullName: undefined });
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([
      dynamicEntityPropertyDefinitionService.getAllEntities(),
      dynamicEntityPropertyService.getAllEntitiesHasDynamicProperty(),
    ])
      .then(([all, hasProperty]) => {
        const entitiesWithProperties = (hasProperty.items ?? []).map(
          (item) => item.entityFullName,
        );
        const availableEntities = (all || []).filter(
          (entity) => !entitiesWithProperties.includes(entity),
        );
        setAllEntities(availableEntities);
      })
      .catch(() => {
        setAllEntities([]);
        abp?.notify?.error?.("Failed to load entities");
      })
      .finally(() => setLoading(false));
  }, [
    isVisible,
    reset,
    dynamicEntityPropertyService,
    dynamicEntityPropertyDefinitionService,
  ]);

  const onSubmit = (values: { entityFullName?: string }) => {
    if (!values.entityFullName) {
      return;
    }
    onSave(values.entityFullName);
    onClose();
  };

  return (
    <Modal
      title={L("SelectAnEntity")}
      open={isVisible}
      onCancel={onClose}
      footer={[
        <button
          key="cancel"
          type="button"
          className="btn btn-light-primary fw-bold mt-3"
          onClick={onClose}
        >
          {L("Cancel")}
        </button>,
        <button
          key="save"
          type="button"
          className="btn btn-primary fw-bold mt-3"
          onClick={handleSubmit(onSubmit)}
          disabled={loading || !isValid}
        >
          {L("Save")}
        </button>,
      ]}
    >
      <div className="form">
        <div className="mb-5">
          <label className="form-label required" htmlFor="SelectEntity">
            {L("Entity")}
          </label>
          <Controller
            name="entityFullName"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                id="SelectEntity"
                className={`form-select mb-1 ${
                  errors.entityFullName ? "is-invalid" : ""
                }`}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={allEntities.map((entity) => ({
                  label: entity,
                  value: entity,
                }))}
                loading={loading}
                placeholder={L("SelectAnEntity")}
              />
            )}
          />
          {errors.entityFullName && (
            <div className="invalid-feedback d-block">
              {L("ThisFieldIsRequired")}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SelectAnEntityModal;
