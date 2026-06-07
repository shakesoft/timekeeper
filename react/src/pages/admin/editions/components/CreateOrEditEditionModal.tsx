import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal, Form, Tabs, Radio, Row, Col, Select } from "antd";
import { useForm, Controller } from "react-hook-form";
import FeatureTree, {
  type FeatureTreeRef,
} from "../../components/common/trees/FeatureTree";
import {
  CommonLookupServiceProxy,
  CreateEditionDto,
  EditionCreateDto,
  EditionEditDto,
  EditionServiceProxy,
  UpdateEditionDto,
  type ComboboxItemDto,
  type FlatFeatureDto,
  type NameValueDto,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

const AppEditionExpireAction = {
  DeactiveTenant: 0,
  AssignToAnotherEdition: 1,
} as const;
type AppEditionExpireAction =
  (typeof AppEditionExpireAction)[keyof typeof AppEditionExpireAction];

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  editionId?: number;
}

const CreateOrEditEditionModal: React.FC<Props> = ({
  isVisible,
  onSave,
  onClose,
  editionId,
}) => {
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { isValid },
  } = useForm<CreateEditionDto | UpdateEditionDto>({
    mode: "onChange",
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  type FeatureTreeEditModel = {
    features: FlatFeatureDto[];
    featureValues: NameValueDto[];
  };
  const [editionData, setEditionData] = useState<FeatureTreeEditModel | null>(
    null,
  );
  const [expiringEditions, setExpiringEditions] = useState<ComboboxItemDto[]>(
    [],
  );

  const [isFree, setIsFree] = useState(true);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [isWaitingDayActive, setIsWaitingDayActive] = useState(false);
  const [expireAction, setExpireAction] = useState<AppEditionExpireAction>(
    AppEditionExpireAction.DeactiveTenant,
  );

  const featureTreeRef = useRef<FeatureTreeRef>(null);
  const editionNameRef = useRef<HTMLInputElement>(null);
  const delayedFocus = useDelayedFocus();

  const editionService = useServiceProxy(EditionServiceProxy, []);
  const commonLookupService = useServiceProxy(CommonLookupServiceProxy, []);

  useEffect(() => {
    if (!isVisible) return;

    setLoading(true);
    const editionPromise = editionId
      ? editionService.getEditionForEdit(editionId)
      : editionService.getEditionForEdit(undefined);
    const expiringEditionsPromise =
      commonLookupService.getEditionsForCombobox(true);

    Promise.all([editionPromise, expiringEditionsPromise]).then(
      ([editionResult, editionsCombobox]) => {
        setEditionData({
          features: editionResult.features ?? [],
          featureValues: editionResult.featureValues ?? [],
        });
        setExpiringEditions([
          {
            value: undefined,
            displayText: L("NotAssigned"),
            isSelected: true,
            init: function (data: ComboboxItemDto) {
              Object.assign(this, data);
              return this;
            },
            toJSON: function () {
              return {
                value: this.value,
                displayText: this.displayText,
                isSelected: this.isSelected,
              };
            },
          },
          ...(editionsCombobox.items ?? []),
        ]);
        reset(editionResult);

        const dto = editionResult;
        setIsFree(true);
        setIsTrialActive(false);
        setIsWaitingDayActive(false);
        setExpireAction(
          dto.edition?.expiringEditionId
            ? AppEditionExpireAction.AssignToAnotherEdition
            : AppEditionExpireAction.DeactiveTenant,
        );

        setLoading(false);
      },
    );
  }, [isVisible, editionId, editionService, commonLookupService, reset]);

  const resetPrices = useCallback(() => {
    setValue("edition.monthlyPrice", undefined);
    setValue("edition.annualPrice", undefined);
  }, [setValue]);

  useEffect(() => {
    if (isFree) {
      resetPrices();
    }
  }, [isFree, resetPrices]);

  const removeExpiringEdition = () => {
    setValue("edition.expiringEditionId", undefined);
  };

  const onSubmit = async (values: CreateEditionDto | UpdateEditionDto) => {
    if (featureTreeRef.current && !featureTreeRef.current.areAllValuesValid()) {
      abp.message.warn(L("InvalidFeaturesWarning"));
      return;
    }

    const featureValues = featureTreeRef.current?.getGrantedFeatures() ?? [];

    setSaving(true);
    try {
      if (editionId) {
        const input = new UpdateEditionDto();
        const ed = new EditionEditDto();
        ed.id = values?.edition?.id;
        ed.displayName = values?.edition?.displayName;
        ed.expiringEditionId =
          expireAction === AppEditionExpireAction.AssignToAnotherEdition
            ? values?.edition?.expiringEditionId
            : undefined;
        input.edition = ed;
        input.featureValues = featureValues;
        await editionService.updateEdition(input);
      } else {
        const input = new CreateEditionDto();
        const ed = new EditionCreateDto();
        const v = values as CreateEditionDto;
        ed.id = v?.edition?.id;
        ed.displayName = v?.edition?.displayName;
        ed.monthlyPrice = isFree ? undefined : v?.edition?.monthlyPrice;
        ed.annualPrice = isFree ? undefined : v?.edition?.annualPrice;
        ed.trialDayCount = isTrialActive
          ? v?.edition?.trialDayCount
          : undefined;
        ed.waitingDayAfterExpire = isWaitingDayActive
          ? v?.edition?.waitingDayAfterExpire
          : undefined;
        ed.expiringEditionId =
          expireAction === AppEditionExpireAction.AssignToAnotherEdition
            ? v?.edition?.expiringEditionId
            : undefined;
        input.edition = ed;
        input.featureValues = featureValues;
        await editionService.createEdition(input);
      }
      abp.notify.success(L("SavedSuccessfully"));
      onSave();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const editionPropertiesTab = (
    <div>
      <Form.Item label={L("EditionName")} required>
        <Controller
          name="edition.displayName"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <input className="form-control" {...field} ref={editionNameRef} />
          )}
        />
      </Form.Item>

      <Form.Item className="mt-5" label={L("SubscriptionPrice")}>
        <Radio.Group
          value={isFree}
          onChange={(e) => setIsFree(e.target.value)}
          style={{ marginBottom: 8 }}
        >
          <Radio value={true}>{L("Free")}</Radio>
          <Radio value={false}>{L("Paid")}</Radio>
        </Radio.Group>
      </Form.Item>

      {!isFree && (
        <>
          <Row gutter={8}>
            <Col span={12}>
              <div className="mb-5">
                <label className="form-label" htmlFor="MonthlyPrice">
                  {L("MonthlyPrice")}
                  <span className="text-danger"> *</span>
                </label>
                <Controller
                  name="edition.monthlyPrice"
                  control={control}
                  rules={{ required: !isFree }}
                  render={({ field }) => (
                    <input
                      id="MonthlyPrice"
                      type="number"
                      {...field}
                      className="form-control"
                      required
                    />
                  )}
                />
              </div>
            </Col>
            <Col span={12}>
              <div className="mb-5">
                <label className="form-label" htmlFor="AnnualPrice">
                  {L("AnnualPrice")}
                  <span className="text-danger"> *</span>
                </label>
                <Controller
                  name="edition.annualPrice"
                  control={control}
                  rules={{ required: !isFree }}
                  render={({ field }) => (
                    <input
                      id="AnnualPrice"
                      type="number"
                      {...field}
                      className="form-control"
                      required
                    />
                  )}
                />
              </div>
            </Col>
          </Row>

          {/* Trial */}
          <label className="form-check form-check-custom form-check-solid py-1 d-block mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              checked={isTrialActive}
              onChange={(e) => setIsTrialActive(e.target.checked)}
            />
            <span className="form-check-label">{L("IsTrialActive")}</span>
          </label>
          {isTrialActive && (
            <div className="mb-5">
              <label className="form-label" htmlFor="TrialDayCount">
                {L("TrialDayCount")}
                <span className="text-danger"> *</span>
              </label>
              <Controller
                name="edition.trialDayCount"
                control={control}
                rules={{ required: isTrialActive }}
                render={({ field }) => (
                  <input
                    id="TrialDayCount"
                    type="number"
                    {...field}
                    className="form-control"
                    required
                  />
                )}
              />
            </div>
          )}

          {/* Waiting Day */}
          <label className="form-check form-check-custom form-check-solid py-1 d-block mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              checked={isWaitingDayActive}
              onChange={(e) => setIsWaitingDayActive(e.target.checked)}
            />
            <span className="form-check-label">
              {L("WaitAfterSubscriptionExpireDate")}
            </span>
          </label>
          {isWaitingDayActive && (
            <div className="mb-5">
              <label className="form-label" htmlFor="WaitingDayAfterExpire">
                {L("WaitingDayAfterExpire")}
                <span className="text-danger"> *</span>
              </label>
              <Controller
                name="edition.waitingDayAfterExpire"
                control={control}
                rules={{ required: isWaitingDayActive }}
                render={({ field }) => (
                  <input
                    id="WaitingDayAfterExpire"
                    type="number"
                    {...field}
                    className="form-control"
                    required
                  />
                )}
              />
            </div>
          )}

          {/* Expire Action */}
          <Form.Item label={L("WhatWillDoneAfterSubscriptionExpiry")}>
            <Radio.Group
              value={expireAction}
              onChange={(e) => {
                setExpireAction(e.target.value);
                if (e.target.value === AppEditionExpireAction.DeactiveTenant) {
                  removeExpiringEdition();
                }
              }}
            >
              <Radio value={AppEditionExpireAction.DeactiveTenant}>
                {L("DeactiveTenant")}
              </Radio>
              <Radio value={AppEditionExpireAction.AssignToAnotherEdition}>
                {L("AssignToAnotherEdition")}
              </Radio>
            </Radio.Group>
          </Form.Item>

          {expireAction === AppEditionExpireAction.AssignToAnotherEdition && (
            <Form.Item label={L("ExpiringEdition")}>
              <div className="mb-5">
                <Controller
                  name="edition.expiringEditionId"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} className="form-select">
                      {expiringEditions.map((e) => (
                        <Select.Option key={String(e.value)} value={e.value}>
                          {e.displayText}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                />
              </div>
            </Form.Item>
          )}
        </>
      )}
    </div>
  );

  const featuresTab = (
    <div>
      {editionData && (
        <FeatureTree ref={featureTreeRef} editData={editionData} />
      )}
    </div>
  );

  return (
    <Modal
      title={editionId ? L("EditEdition") : L("CreateNewEdition")}
      open={isVisible}
      onCancel={onClose}
      destroyOnHidden
      width={800}
      afterOpenChange={(opened) => {
        if (opened) {
          delayedFocus(editionNameRef);
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
      <Form layout="vertical" disabled={loading}>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: L("EditionProperties"),
              children: editionPropertiesTab,
            },
            { key: "2", label: L("Features"), children: featuresTab },
          ]}
        />
      </Form>
    </Modal>
  );
};

export default CreateOrEditEditionModal;
