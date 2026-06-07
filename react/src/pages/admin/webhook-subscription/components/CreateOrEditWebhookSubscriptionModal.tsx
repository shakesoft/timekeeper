import React, { useEffect, useRef, useState } from "react";
import { Modal, Select } from "antd";
import { useForm, Controller } from "react-hook-form";
import {
  WebhookSubscription,
  WebhookSubscriptionServiceProxy,
  GetAllAvailableWebhooksOutput,
} from "@api/generated/service-proxies";
import KeyValueListManager, {
  type KeyValueItem,
} from "../../settings/host/components/KeyValueListManager";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  subscriptionId?: string;
}

const urlPattern = new RegExp(
  "https?://(?:www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)",
);

const CreateOrEditWebhookSubscriptionModal: React.FC<Props> = ({
  visible,
  onClose,
  onSaved,
  subscriptionId,
}) => {
  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors, isValid },
  } = useForm<WebhookSubscription>({ mode: "onChange" });
  const [saving, setSaving] = useState(false);
  const [availableWebhooks, setAvailableWebhooks] = useState<
    GetAllAvailableWebhooksOutput[]
  >([]);
  const [headers, setHeaders] = useState<KeyValueItem[]>([]);
  const webhookUriInputRef = useRef<HTMLInputElement | null>(null);
  const delayedFocus = useDelayedFocus();

  const service = useServiceProxy(WebhookSubscriptionServiceProxy, []);

  useEffect(() => {
    service
      .getAllAvailableWebhooks()
      .then((r) => setAvailableWebhooks(r.items ?? []));
  }, [service]);

  useEffect(() => {
    if (!visible) return;
    if (!subscriptionId) {
      reset(new WebhookSubscription());
      setHeaders([]);
      return;
    }
    service.getSubscription(subscriptionId).then((sub) => {
      reset(sub);
      const headerItems: KeyValueItem[] = Object.keys(sub.headers || {}).map(
        (k) => ({ key: k, value: (sub.headers || {})[k] }),
      );
      setHeaders(headerItems);
    });
  }, [visible, subscriptionId, service, reset]);

  const onSubmit = async (values: WebhookSubscription) => {
    if (!isValid) return;
    try {
      setSaving(true);

      const body = new WebhookSubscription(values);
      const headersObject: Record<string, string> = {};
      (headers || []).forEach((h) => {
        if ((h.key || "").trim()) headersObject[h.key] = h.value ?? "";
      });
      body.headers = headersObject;

      if (subscriptionId) {
        body.id = subscriptionId;
        await service.updateSubscription(body);
      } else {
        await service.addSubscription(body);
      }

      abp.message.success(L("SavedSuccessfully"));
      onSaved();
      onClose();
    } catch {
      abp.message.error(L("SavedFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={
        subscriptionId
          ? L("EditWebhookSubscription")
          : L("AddNewWebhookSubscription")
      }
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
          disabled={saving || !isValid}
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
      mask={{ closable: false }}
      destroyOnHidden
      width={800}
      afterOpenChange={(opened) => {
        if (opened) {
          delayedFocus(webhookUriInputRef);
        }
      }}
    >
      <div className="form">
        <div className="mb-5">
          <label className="form-label" htmlFor="WebhookEndpoint">
            {L("WebhookEndpoint")}
          </label>
          {(() => {
            const { ref: webhookUriRef, ...webhookUriRegister } = register(
              "webhookUri",
              {
                required: {
                  value: true,
                  message: L("ThisFieldIsRequired"),
                },
                validate: (value) =>
                  urlPattern.test((value || "").trim()) ||
                  L("InvalidWebSiteAddress"),
              },
            );

            return (
              <input
                id="WebhookEndpoint"
                className={`form-control ${
                  errors.webhookUri ? "is-invalid" : ""
                }`}
                placeholder="https://example.com/postreceive"
                {...webhookUriRegister}
                ref={(el) => {
                  webhookUriRef(el);
                  webhookUriInputRef.current = el;
                }}
              />
            );
          })()}
          {errors.webhookUri && (
            <div className="invalid-feedback d-block">
              {errors.webhookUri.message?.toString() ||
                L("ThisFieldIsRequired")}
            </div>
          )}
        </div>

        <div className="mb-5">
          <label className="form-label" htmlFor="WebhookEvents">
            {L("WebhookEvents")}
          </label>
          <Controller
            name="webhooks"
            control={control}
            rules={{
              required: {
                value: true,
                message: L("ThisFieldIsRequired"),
              },
              validate: (value) =>
                Array.isArray(value) && value.length > 0
                  ? true
                  : L("ThisFieldIsRequired"),
            }}
            render={({ field }) => (
              <>
                <Select
                  id="WebhookEvents"
                  className={`form-select ${
                    errors.webhooks ? "is-invalid" : ""
                  }`}
                  mode="multiple"
                  showSearch
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  options={(availableWebhooks || []).map((w) => ({
                    label: w.displayName || w.name || "-",
                    value: w.name,
                  }))}
                  filterOption={(input, option) =>
                    (option?.label as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase()) ||
                    (option?.value as string)
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  placeholder={L("SearchWithThreeDot")}
                />
                {errors.webhooks && (
                  <div className="invalid-feedback d-block">
                    {errors.webhooks.message?.toString() ||
                      L("ThisFieldIsRequired")}
                  </div>
                )}
              </>
            )}
          />
        </div>

        <KeyValueListManager
          header={L("AdditionalWebhookHeaders")}
          keyPlaceHolder={L("HeaderKey")}
          valuePlaceHolder={L("HeaderValue")}
          items={headers}
          onChange={setHeaders}
        />
      </div>
    </Modal>
  );
};

export default CreateOrEditWebhookSubscriptionModal;
