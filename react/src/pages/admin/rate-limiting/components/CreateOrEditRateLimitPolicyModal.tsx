import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import { useForm } from "react-hook-form";
import {
  CreateOrEditRateLimitPolicyDto,
  RateLimitAlgorithm,
  RateLimitPolicyServiceProxy,
  type ComboboxItemDto,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  policyId?: number;
}

const toNumber = (v: string) => (v === "" ? undefined : Number(v));

const CreateOrEditRateLimitPolicyModal: React.FC<Props> = ({
  isVisible,
  onClose,
  onSave,
  policyId,
}) => {
  const rateLimitPolicyService = useServiceProxy(
    RateLimitPolicyServiceProxy,
    [],
  );
  const { register, handleSubmit, reset, watch, formState } =
    useForm<CreateOrEditRateLimitPolicyDto>();
  const { errors } = formState;
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [policy, setPolicy] = useState<CreateOrEditRateLimitPolicyDto>();
  const [algorithms, setAlgorithms] = useState<ComboboxItemDto[]>([]);
  const [partitionTypes, setPartitionTypes] = useState<ComboboxItemDto[]>([]);

  useEffect(() => {
    if (!isVisible) return;
    setLoading(true);
    rateLimitPolicyService
      .getPolicyForEdit(policyId)
      .then((result) => {
        setAlgorithms(result.algorithms ?? []);
        setPartitionTypes(result.partitionTypes ?? []);
        setPolicy(result.rateLimitPolicy);
      })
      .finally(() => setLoading(false));
  }, [isVisible, policyId, rateLimitPolicyService]);

  // Reset after the <option>s are rendered so the selects pick up their values.
  useEffect(() => {
    if (policy) reset(policy);
  }, [policy, reset]);

  // FixedWindow = 0, SlidingWindow = 1, TokenBucket = 2, Concurrency = 3
  const algorithm = Number(watch("algorithm"));
  const showWindow =
    algorithm === RateLimitAlgorithm.FixedWindow ||
    algorithm === RateLimitAlgorithm.SlidingWindow;
  const showSlidingWindow = algorithm === RateLimitAlgorithm.SlidingWindow;
  const showTokenBucket = algorithm === RateLimitAlgorithm.TokenBucket;
  const isGlobal = watch("isGlobal");

  const onSubmit = async (values: CreateOrEditRateLimitPolicyDto) => {
    setSaving(true);
    try {
      await rateLimitPolicyService.createOrEdit(
        new CreateOrEditRateLimitPolicyDto({ ...values, id: policyId }),
      );
      abp.notify.info(L("SavedSuccessfully"));
      onClose();
      onSave();
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (name: keyof CreateOrEditRateLimitPolicyDto) =>
    `form-control${errors[name] ? " is-invalid" : ""}`;

  const numberField = (
    name: keyof CreateOrEditRateLimitPolicyDto,
    label: string,
    options: { required?: boolean; min?: number; max?: number },
  ) => (
    <div className="mb-5">
      <label
        htmlFor={`Policy_${name}`}
        className={`form-label${options.required ? " required" : ""}`}
      >
        {L(label)}
      </label>
      <input
        id={`Policy_${name}`}
        className={inputClass(name)}
        type="number"
        min={options.min}
        max={options.max}
        {...register(name, { ...options, setValueAs: toNumber })}
      />
    </div>
  );

  return (
    <Modal
      title={
        policyId
          ? `${L("EditRateLimitPolicy")}: ${policy?.name ?? ""}`
          : L("CreateNewRateLimitPolicy")
      }
      open={isVisible}
      onCancel={onClose}
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
          disabled={saving || loading}
        >
          <i className="fa fa-save"></i>
          <span className="ms-2">{L("Save")}</span>
        </button>,
      ]}
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <label htmlFor="PolicyName" className="form-label required">
            {L("PolicyName")}
          </label>
          <input
            id="PolicyName"
            className={inputClass("name")}
            type="text"
            maxLength={128}
            {...register("name", { required: true, maxLength: 128 })}
          />
        </div>

        <div className="mb-5">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="PolicyIsEnabled"
              {...register("isEnabled")}
            />
            <label className="form-check-label" htmlFor="PolicyIsEnabled">
              {L("IsEnabled")}
            </label>
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="PolicyAlgorithm" className="form-label required">
            {L("Algorithm")}
          </label>
          <select
            id="PolicyAlgorithm"
            className="form-select"
            {...register("algorithm", { required: true, setValueAs: Number })}
          >
            {algorithms.map((item) => (
              <option key={item.value} value={item.value}>
                {L(item.displayText!)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label htmlFor="PolicyPartitionType" className="form-label required">
            {L("PartitionType")}
          </label>
          <select
            id="PolicyPartitionType"
            className="form-select"
            {...register("partitionType", {
              required: true,
              setValueAs: Number,
            })}
          >
            {partitionTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {L(item.displayText!)}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="PolicyIsGlobal"
              {...register("isGlobal")}
            />
            <label className="form-check-label" htmlFor="PolicyIsGlobal">
              {L("IsGlobal")}
            </label>
          </div>
        </div>

        {!isGlobal && (
          <div className="mb-5">
            <label htmlFor="PolicyEndpointPattern" className="form-label">
              {L("EndpointPattern")}
            </label>
            <input
              id="PolicyEndpointPattern"
              className={`${inputClass("endpointPattern")} mb-2`}
              type="text"
              maxLength={256}
              {...register("endpointPattern", { maxLength: 256 })}
            />
            <small className="form-text text-muted">
              {L("EndpointPatternHelpText")}
            </small>
          </div>
        )}

        {numberField("permitLimit", "PermitLimit", { required: true, min: 1 })}

        {showWindow &&
          numberField("windowInSeconds", "WindowInSeconds", {
            required: true,
            min: 1,
          })}

        {showSlidingWindow &&
          numberField("segmentsPerWindow", "SegmentsPerWindow", {
            required: true,
            min: 1,
          })}

        {showTokenBucket &&
          numberField("tokensPerPeriod", "TokensPerPeriod", {
            required: true,
            min: 1,
          })}

        {showTokenBucket &&
          numberField(
            "replenishmentPeriodInSeconds",
            "ReplenishmentPeriodInSeconds",
            { required: true, min: 1 },
          )}

        {numberField("queueLimit", "QueueLimit", { min: 0 })}

        {numberField("httpStatusCode", "HttpStatusCode", {
          min: 400,
          max: 599,
        })}

        <div className="mb-5">
          <label htmlFor="PolicyCustomMessage" className="form-label">
            {L("CustomMessage")}
          </label>
          <textarea
            id="PolicyCustomMessage"
            className={inputClass("customMessage")}
            maxLength={512}
            rows={3}
            {...register("customMessage", { maxLength: 512 })}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CreateOrEditRateLimitPolicyModal;
