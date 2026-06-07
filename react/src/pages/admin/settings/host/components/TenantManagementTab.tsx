import React from "react";
import { Form, Select } from "antd";
import { Controller, type Control, type UseFormWatch } from "react-hook-form";
import {
  HostSettingsEditDto,
  SubscribableEditionComboboxItemDto,
} from "@api/generated/service-proxies";
import L from "@/lib/L";

interface Props {
  control: Control<HostSettingsEditDto>;
  editions: SubscribableEditionComboboxItemDto[];
  watch: UseFormWatch<HostSettingsEditDto>;
}

const TenantManagementTab: React.FC<Props> = ({ control, editions, watch }) => {
  const allowSelfRegistration = watch("tenantManagement.allowSelfRegistration");
  return (
    <Form layout="vertical">
      <h5 className="mt-2 mb-3">{L("FormBasedRegistration")}</h5>
      <Form.Item className="mb-0">
        <Controller
          name="tenantManagement.allowSelfRegistration"
          control={control}
          render={({ field }) => (
            <>
              <div className="form-check form-check-custom form-check-solid">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={!!field.value}
                  onChange={field.onChange}
                  id="allowSelfRegistration"
                />
                <label
                  className="form-check-label"
                  htmlFor="allowSelfRegistration"
                >
                  {L("AllowTenantsToRegisterThemselves")}
                </label>
              </div>
              <span className="d-flex form-text text-muted mb-5">
                {L("AllowTenantsToRegisterThemselves_Hint")}
              </span>
            </>
          )}
        />
      </Form.Item>
      {allowSelfRegistration && (
        <>
          <Form.Item className="mb-0">
            <Controller
              name="tenantManagement.isNewRegisteredTenantActiveByDefault"
              control={control}
              render={({ field }) => (
                <>
                  <div className="form-check form-check-custom form-check-solid">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={!!field.value}
                      onChange={field.onChange}
                      id="isNewRegisteredTenantActive"
                    />
                    <label
                      className="form-check-label"
                      htmlFor="isNewRegisteredTenantActive"
                    >
                      {L("NewRegisteredTenantsIsActiveByDefault")}
                    </label>
                  </div>
                  <span className="d-flex form-text text-muted mb-5">
                    {L("NewRegisteredTenantsIsActiveByDefault_Hint")}
                  </span>
                </>
              )}
            />
          </Form.Item>
        </>
      )}

      <h6 className="mt-4 mb-3">{L("SecurityImage")}</h6>
      <Form.Item>
        <Controller
          name="tenantManagement.captchaSettings.useCaptchaOnRegistration"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                  checked={!!field.value}
                onChange={field.onChange}
                id="useCaptchaOnRegistration"
              />
              <label
                className="form-check-label"
                htmlFor="useCaptchaOnRegistration"
              >
                {L("UseCaptchaOnRegistration")}
              </label>
            </div>
          )}
        />
      </Form.Item>
      <Form.Item>
        <Controller
          name="tenantManagement.captchaSettings.useCaptchaOnResetPassword"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                  checked={!!field.value}
                onChange={field.onChange}
                id="useCaptchaOnResetPassword"
              />
              <label
                className="form-check-label"
                htmlFor="useCaptchaOnResetPassword"
              >
                {L("UseCaptchaOnResetPassword")}
              </label>
            </div>
          )}
        />
      </Form.Item>
      <Form.Item>
        <Controller
          name="tenantManagement.captchaSettings.useCaptchaOnEmailActivation"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                  checked={!!field.value}
                onChange={field.onChange}
                id="useCaptchaOnEmailActivation"
              />
              <label
                className="form-check-label"
                htmlFor="useCaptchaOnEmailActivation"
              >
                {L("UseCaptchaOnEmailActivation")}
              </label>
            </div>
          )}
        />
      </Form.Item>
      <Form.Item>
        <Controller
          name="tenantManagement.isRestrictedEmailDomainEnabled"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                  checked={!!field.value}
                onChange={field.onChange}
                id="isRestrictedEmailDomainEnabled"
              />
              <label
                className="form-check-label"
                htmlFor="isRestrictedEmailDomainEnabled"
              >
                {L("IsRestrictedEmailDomainEnabled")}
              </label>
            </div>
          )}
        />
      </Form.Item>
      <Form.Item className="mt-5" label={L("Edition")}>
        <Controller
          name="tenantManagement.defaultEditionId"
          control={control}
          render={({ field }) => (
            <Select
              className="w-100"
              {...field}
              value={
                field.value === undefined || field.value === null
                  ? ""
                  : field.value
              }
              onChange={(value) =>
                field.onChange(value === "" ? undefined : value)
              }
              allowClear
              options={(editions ?? []).map((e) => ({
                label: e.displayText,
                value: e.value === "" ? "" : e.value ? Number(e.value) : "",
              }))}
            />
          )}
        />
      </Form.Item>
    </Form>
  );
};

export default TenantManagementTab;
