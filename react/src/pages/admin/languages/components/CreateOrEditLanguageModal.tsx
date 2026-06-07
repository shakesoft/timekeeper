import React, { useState, useEffect, useRef } from "react";
import { Modal } from "antd";
import { useForm, Controller } from "react-hook-form";
import {
  CreateOrUpdateLanguageInput,
  LanguageServiceProxy,
  type ApplicationLanguageEditDto,
  type ComboboxItemDto,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  languageId?: number;
}

const CreateOrEditLanguageModal: React.FC<Props> = ({
  isVisible,
  onClose,
  onSave,
  languageId,
}) => {
  const { handleSubmit, control, reset, formState } =
    useForm<ApplicationLanguageEditDto>();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [languageNames, setLanguageNames] = useState<ComboboxItemDto[]>([]);
  const [flags, setFlags] = useState<ComboboxItemDto[]>([]);
  const languageSelectRef = useRef<HTMLSelectElement>(null);
  const delayedFocus = useDelayedFocus();

  const languageService = useServiceProxy(LanguageServiceProxy, []);

  useEffect(() => {
    if (!isVisible) return;
    setLoading(true);
    languageService.getLanguageForEdit(languageId).then((result) => {
      reset(result.language);
      setLanguageNames(result.languageNames ?? []);
      setFlags(result.flags ?? []);
      setLoading(false);
    });
  }, [isVisible, languageId, languageService, reset]);

  const onSubmit = async (values: ApplicationLanguageEditDto) => {
    setSaving(true);
    try {
      const input = new CreateOrUpdateLanguageInput();
      input.language = values;
      await languageService.createOrUpdateLanguage(input);
      onSave();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={languageId ? L("EditLanguage") : L("CreateNewLanguage")}
      open={isVisible}
      onCancel={onClose}
      afterOpenChange={(opened) => {
        if (opened) {
          delayedFocus(languageSelectRef);
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
          className="btn btn-primary fw-bold ms-3"
          onClick={handleSubmit(onSubmit)}
          disabled={saving || loading || !formState.isValid}
        >
          <i className="fa fa-save"></i>
          <span className="ms-2">{L("Save")}</span>
        </button>,
      ]}
    >
      <div className="mb-5">
        <label className="form-label fw-bold">{L("CultureName")}</label>
        <Controller
          name="name"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <select
              className="form-select"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              disabled={!!languageId}
              ref={languageSelectRef}
            >
              <option value="">{L("NotAssigned")}</option>
              {languageNames.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.displayText}
                </option>
              ))}
            </select>
          )}
        />
      </div>

      <div className="mb-5">
        <label className="form-label fw-bold">{L("UICultureName")}</label>
        <Controller
          name="icon"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <select
              className="form-select"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
            >
              <option value="">{L("NotAssigned")}</option>
              {flags.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.displayText}
                </option>
              ))}
            </select>
          )}
        />
      </div>

      <div className="mb-0">
        <Controller
          name="isEnabled"
          control={control}
          render={({ field }) => (
            <label className="form-check form-check-custom form-check-solid py-1">
              <input
                id="EditLanguage_IsEnabled"
                type="checkbox"
                className="form-check-input"
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
              />
              <span className="form-check-label">{L("IsEnabled")}</span>
            </label>
          )}
        />
      </div>
    </Modal>
  );
};

export default CreateOrEditLanguageModal;
