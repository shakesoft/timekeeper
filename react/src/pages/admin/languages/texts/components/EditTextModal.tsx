import React, { useState, useEffect, useRef } from "react";
import { Modal } from "antd";
import {
  LanguageServiceProxy,
  UpdateLanguageTextInput,
} from "@api/generated/service-proxies";
import L from "@/lib/L";
import { useServiceProxy } from "@/api/service-proxy-factory";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: {
    baseLanguageName: string;
    targetLanguageName: string;
    sourceName: string;
    key: string;
    baseValue: string;
    targetValue: string;
  };
}

const EditTextModal: React.FC<Props> = ({
  isVisible,
  onClose,
  onSave,
  initialData,
}) => {
  const [saving, setSaving] = useState(false);
  const languageService = useServiceProxy(LanguageServiceProxy, []);
  type AbpLanguage = { name: string; icon?: string };
  const [baseLanguage, setBaseLanguage] = useState<AbpLanguage | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<AbpLanguage | null>(
    null,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const delayedFocus = useDelayedFocus();

  useEffect(() => {
    if (isVisible && initialData) {
      {
        const baseLanguage = abp.localization.languages.find(
          (l) => (l as { name?: string }).name === initialData.baseLanguageName,
        ) as AbpLanguage | undefined;
        setBaseLanguage(baseLanguage ?? null);
      }

      {
        const targetLanguage = abp.localization.languages.find(
          (l) =>
            (l as { name?: string }).name === initialData.targetLanguageName,
        ) as AbpLanguage | undefined;
        setTargetLanguage(targetLanguage ?? null);
      }
    }
  }, [isVisible, initialData]);

  const [value, setValue] = useState("");
  useEffect(() => {
    setValue(initialData?.targetValue ?? "");
  }, [initialData]);

  // Focus will be handled via Modal afterOpenChange for consistency

  const handleSave = async () => {
    if (!initialData) return;
    try {
      setSaving(true);
      const input = new UpdateLanguageTextInput({
        sourceName: initialData.sourceName,
        key: initialData.key,
        languageName: initialData.targetLanguageName,
        value: value,
      });
      await languageService.updateLanguageText(input);
      abp?.notify?.success?.(L("SavedSuccessfully"));
      onSave();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={L("EditText")}
      open={isVisible}
      onCancel={onClose}
      afterOpenChange={(opened) => {
        if (opened) {
          delayedFocus(textareaRef);
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
          onClick={handleSave}
          disabled={saving}
        >
          <i className="fa fa-save"></i>
          <span className="ms-2">{L("Save")}</span>
        </button>,
      ]}
    >
      <div className="mb-5">
        <div className="text-muted mb-2">{L("Key")}</div>
        <strong>{initialData?.key}</strong>
      </div>
      <div className="mb-5">
        <div className="d-flex align-items-center mb-2">
          <i className={`${baseLanguage?.icon} me-2`}></i>
          <span>{initialData?.baseLanguageName}</span>
        </div>
        <textarea
          className="form-control"
          value={initialData?.baseValue}
          readOnly
          disabled
          rows={4}
        />
      </div>
      <div className="mb-0">
        <div className="d-flex align-items-center mb-2">
          <i className={`${targetLanguage?.icon} me-2`}></i>
          <span>{initialData?.targetLanguageName}</span>
        </div>
        <textarea
          className="form-control"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={4}
          ref={textareaRef}
        />
      </div>
    </Modal>
  );
};

export default EditTextModal;
