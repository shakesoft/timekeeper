import React, { useEffect, useState, useRef } from "react";
import { Modal } from "antd";
import { useForm, Controller } from "react-hook-form";
import {
  DynamicEntityPropertyDefinitionServiceProxy,
  DynamicPropertyDto,
  DynamicPropertyServiceProxy,
  useServiceProxy,
} from "../../../../api/service-proxy-factory";
import L from "@/lib/L";
import PermissionTreeModal from "../../components/common/trees/PermissionTreeModal";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  propertyId?: number;
}

const CreateOrEditPropertyModal: React.FC<Props> = ({
  isVisible,
  onClose,
  onSave,
  propertyId,
}) => {
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isValid },
  } = useForm<DynamicPropertyDto>({ mode: "onChange" });
  const [saving, setSaving] = useState(false);
  const [allInputTypes, setAllInputTypes] = useState<string[]>([]);

  const [isPermissionModalVisible, setPermissionModalVisible] = useState(false);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const delayedFocus = useDelayedFocus();

  const dynamicPropertyService = useServiceProxy(
    DynamicPropertyServiceProxy,
    [],
  );
  const dynamicEntityPropertyDefinitionService = useServiceProxy(
    DynamicEntityPropertyDefinitionServiceProxy,
    [],
  );

  useEffect(() => {
    dynamicEntityPropertyDefinitionService
      .getAllAllowedInputTypeNames()
      .then(setAllInputTypes)
      .catch(() => setAllInputTypes([]));
  }, [dynamicEntityPropertyDefinitionService]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    if (propertyId) {
      dynamicPropertyService.get(propertyId).then((data) => {
        reset(data);
      });
    } else {
      reset(new DynamicPropertyDto());
    }
  }, [propertyId, isVisible, reset, dynamicPropertyService]);

  const onSubmit = async (values: DynamicPropertyDto) => {
    setSaving(true);
    try {
      if (propertyId) {
        await dynamicPropertyService.update(values);
      } else {
        await dynamicPropertyService.add(values);
      }
      onSave();
      onClose();
      abp?.notify?.success?.(L("SavedSuccessfully"));
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionSelect = (permissions: string[]) => {
    if (permissions && permissions.length > 0) {
      setValue("permission", permissions[0]);
    }
    setPermissionModalVisible(false);
  };

  return (
    <>
      <Modal
        title={
          propertyId ? L("EditDynamicProperty") : L("AddNewDynamicProperty")
        }
        open={isVisible}
        onCancel={onClose}
        destroyOnClose={true}
        afterOpenChange={(opened) => {
          if (opened) {
            delayedFocus(firstInputRef);
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
            type="button"
            className="btn btn-primary fw-bold d-inline-flex align-items-center"
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
              htmlFor="DynamicPropertyName"
            >
              {L("PropertyName")}
            </label>
            <Controller
              name="propertyName"
              control={control}
              rules={{ required: true }}
              render={({ field }) => {
                const { ref, ...rest } = field;
                return (
                  <input
                    id="DynamicPropertyName"
                    {...rest}
                    className={`form-control ${
                      errors.propertyName ? "is-invalid" : ""
                    }`}
                    ref={(el) => {
                      ref(el);
                      firstInputRef.current = el;
                    }}
                  />
                );
              }}
            />
            {errors.propertyName && (
              <div className="invalid-feedback d-block">
                {L("ThisFieldIsRequired")}
              </div>
            )}
          </div>

          <div className="mb-5">
            <label className="form-label" htmlFor="DynamicDisplayName">
              {L("DisplayName")}
            </label>
            <Controller
              name="displayName"
              control={control}
              render={({ field }) => (
                <input
                  id="DynamicDisplayName"
                  {...field}
                  className="form-control"
                />
              )}
            />
          </div>

          <div className="mb-5">
            <label className="form-label required" htmlFor="DynamicInputType">
              {L("InputType")}
            </label>
            <Controller
              name="inputType"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <select
                  id="DynamicInputType"
                  className={`form-select ${
                    errors.inputType ? "is-invalid" : ""
                  }`}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                >
                  <option value="" disabled>
                    {L("SelectAnInputType")}
                  </option>
                  {allInputTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.inputType && (
              <div className="invalid-feedback d-block">
                {L("ThisFieldIsRequired")}
              </div>
            )}
          </div>

          <div className="mb-5">
            <label className="form-label" htmlFor="DynamicPermission">
              {L("Permission")}
            </label>
            <Controller
              name="permission"
              control={control}
              render={({ field }) => (
                <div className="input-group">
                  <input
                    id="DynamicPermission"
                    {...field}
                    type="text"
                    className="form-control"
                    readOnly
                  />
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setPermissionModalVisible(true)}
                  >
                    ...
                  </button>
                </div>
              )}
            />
          </div>
        </div>
      </Modal>

      <PermissionTreeModal
        isVisible={isPermissionModalVisible}
        onClose={() => setPermissionModalVisible(false)}
        onSave={handlePermissionSelect}
        initialPermissions={propertyId ? [propertyId.toString()] : []}
        disableCascade={false}
      />
    </>
  );
};
export default CreateOrEditPropertyModal;
