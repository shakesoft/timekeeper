import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Modal, Form, Select, DatePicker } from "antd";
import { Controller, useForm } from "react-hook-form";
import {
  CommonLookupServiceProxy,
  SubscribableEditionComboboxItemDto,
  TenantEditDto,
  TenantServiceProxy,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@api/service-proxy-factory";
import L from "@/lib/L";
import { Dayjs } from "dayjs";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

type Props = {
  isVisible: boolean;
  tenantId?: number;
  onClose: () => void;
  onSaved: () => void;
};

type FormValues = {
  name: string;
  connectionString?: string;
  editionId?: number | null;
  isUnlimited: boolean;
  subscriptionEndDateUtc?: Dayjs | null;
  isInTrialPeriod: boolean;
  isActive: boolean;
};

const EditTenantModal: React.FC<Props> = ({
  isVisible,
  tenantId,
  onClose,
  onSaved,
}) => {
  const tenantService = useServiceProxy(TenantServiceProxy, []);
  const lookupService = useServiceProxy(CommonLookupServiceProxy, []);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isValid },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      name: "",
      connectionString: "",
      editionId: 0,
      isUnlimited: true,
      subscriptionEndDateUtc: null,
      isInTrialPeriod: false,
      isActive: true,
    },
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editions, setEditions] = useState<
    SubscribableEditionComboboxItemDto[]
  >([]);
  const [tenant, setTenant] = useState<TenantEditDto | null>(null);
  const [currentConnectionString, setCurrentConnectionString] = useState<
    string | null
  >(null);
  const [isSubscriptionFieldsVisible, setSubscriptionFieldsVisible] =
    useState(false);
  const [isSelectedEditionFree, setSelectedEditionFree] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const delayedFocus = useDelayedFocus();

  const onEditionChangeInternal = useCallback(
    (
      editionId: number | null,
      editionsList?: SubscribableEditionComboboxItemDto[],
    ) => {
      const id = editionId ?? 0;
      const editionsToUse = editionsList || editions;
      const selected = editionsToUse.find(
        (e) => (e.value ?? "") === String(id),
      );
      const free = !!selected?.isFree;
      setSelectedEditionFree(free);
      const visible = id > 0 && !free;
      setSubscriptionFieldsVisible(visible);
      if (free) {
        setValue("isInTrialPeriod", false);
        setValue("isUnlimited", true);
      }
    },
    [editions, setValue],
  );

  useEffect(() => {
    if (!isVisible || !tenantId) return;
    setLoading(true);

    const loadData = async () => {
      try {
        const editionsRes = await lookupService.getEditionsForCombobox(false);
        const items = editionsRes.items ?? [];
        const notAssigned = new SubscribableEditionComboboxItemDto({
          value: undefined,
          displayText: L("NotAssigned"),
          isSelected: false,
          isFree: false,
        });
        const editionsList = [notAssigned, ...items];
        setEditions(editionsList);

        const dto = await tenantService.getTenantForEdit(tenantId);
        setTenant(dto);
        setCurrentConnectionString(dto.connectionString || null);
        reset({
          name: dto.name,
          connectionString: dto.connectionString || "",
          editionId: dto.editionId ?? 0,
          isUnlimited: !dto.subscriptionEndDateUtc,
          subscriptionEndDateUtc: dto.subscriptionEndDateUtc,
          isInTrialPeriod: dto.isInTrialPeriod,
          isActive: dto.isActive,
        });

        // Edition change logic inline
        const id = dto.editionId ?? 0;
        const selected = editionsList.find(
          (e) => (e.value ?? "") === String(id),
        );
        const free = !!selected?.isFree;
        setSelectedEditionFree(free);
        const visible = id > 0 && !free;
        setSubscriptionFieldsVisible(visible);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, tenantId]);

  const onEditionChange = (editionId?: number | null) => {
    onEditionChangeInternal(editionId ?? 0);
  };

  const onUnlimitedChange = (checked: boolean) => {
    setValue("isUnlimited", checked);
    if (checked) {
      setValue("subscriptionEndDateUtc", null);
      setValue("isInTrialPeriod", false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!tenant) return;
    setSaving(true);
    try {
      const dto = new TenantEditDto(tenant);
      dto.name = values.name?.trim();
      dto.connectionString = values.connectionString?.trim() || undefined;
      dto.editionId =
        values.editionId && values.editionId > 0 ? values.editionId : undefined;
      dto.isActive = values.isActive;
      dto.isInTrialPeriod = values.isInTrialPeriod;
      dto.subscriptionEndDateUtc =
        values.isUnlimited || !dto.editionId
          ? undefined
          : (values.subscriptionEndDateUtc ?? undefined);

      await tenantService.updateTenant(dto);
      onSaved();
      onClose();
    } catch {
      abp.message.error(L("AnErrorOccurred"));
    } finally {
      setSaving(false);
    }
  };

  const isUnlimited = watch("isUnlimited");

  const editionOptions = useMemo(
    () =>
      (editions ?? []).map((e) => ({
        label: e.displayText,
        value: e.value ? Number(e.value) : 0,
      })),
    [editions],
  );

  return (
    <Modal
      open={isVisible}
      onCancel={onClose}
      title={L("EditTenant")}
      width={720}
      destroyOnHidden
      afterOpenChange={(opened) => {
        if (opened) {
          delayedFocus(nameInputRef);
        }
      }}
      footer={[
        <button
          key="cancel"
          type="button"
          className="btn btn-light-primary fw-bold"
          onClick={onClose}
          disabled={saving || loading}
        >
          {L("Cancel")}
        </button>,
        <button
          key="save"
          type="button"
          className="btn btn-primary fw-bold d-inline-flex align-items-center"
          onClick={handleSubmit(onSubmit)}
          disabled={saving || loading || !isValid}
        >
          {(saving || loading) && (
            <span className="spinner-border spinner-border-sm me-2"></span>
          )}
          <i className="fa fa-save me-2 align-middle"></i>
          <span className="align-middle">{L("Save")}</span>
        </button>,
      ]}
    >
      <Form layout="vertical">
        <Form.Item className="mb-5" label={L("TenantName")} required>
          <Controller
            name="name"
            control={control}
            rules={{ required: true, pattern: /^[a-zA-Z][a-zA-Z0-9_-]{1,}$/ }}
            render={({ field }) => (
              <input {...field} className="form-control" ref={nameInputRef} />
            )}
          />
        </Form.Item>
        {currentConnectionString && (
          <>
            <Form.Item
              className="mb-5"
              label={L("DatabaseConnectionString")}
              required
            >
              <Controller
                name="connectionString"
                control={control}
                rules={{ required: !!currentConnectionString }}
                render={({ field }) => (
                  <input {...field} className="form-control" />
                )}
              />
            </Form.Item>
            <div className="text-warning" style={{ marginBottom: 16 }}>
              {L("TenantDatabaseConnectionStringChangeWarningMessage")}
            </div>
          </>
        )}

        <Form.Item className="mb-5" label={L("Edition")}>
          <Controller
            name="editionId"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                onChange={(v) => {
                  field.onChange(v);
                  onEditionChange(v);
                }}
                options={editionOptions}
              />
            )}
          />
        </Form.Item>

        {isSubscriptionFieldsVisible && (
          <>
            <div className="mb-5">
              <Controller
                name="isUnlimited"
                control={control}
                render={({ field }) => (
                  <label className="form-check form-check-custom form-check-solid py-1">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={field.value}
                      onChange={(e) => onUnlimitedChange(e.target.checked)}
                    />
                    <span className="form-check-label">
                      {L("UnlimitedTimeSubscription")}
                    </span>
                  </label>
                )}
              />
            </div>

            {!isUnlimited && (
              <Form.Item
                className="mb-5"
                label={L("SubscriptionEndDateUtc")}
                required
              >
                <Controller
                  name="subscriptionEndDateUtc"
                  control={control}
                  rules={{ required: !isUnlimited }}
                  render={({ field }) => (
                    <DatePicker
                      className="form-control mb-5"
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                    />
                  )}
                />
              </Form.Item>
            )}

            {!isUnlimited && !isSelectedEditionFree && (
              <div className="mb-5">
                <Controller
                  name="isInTrialPeriod"
                  control={control}
                  render={({ field }) => (
                    <label className="form-check form-check-custom form-check-solid py-1">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        disabled={isSelectedEditionFree}
                      />
                      <span className="form-check-label">
                        {L("IsInTrialPeriod")}
                      </span>
                    </label>
                  )}
                />
              </div>
            )}
          </>
        )}

        <div className="mb-5">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <label className="form-check form-check-custom form-check-solid py-1">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <span className="form-check-label">{L("Active")}</span>
              </label>
            )}
          />
        </div>
      </Form>
    </Modal>
  );
};

export default EditTenantModal;
