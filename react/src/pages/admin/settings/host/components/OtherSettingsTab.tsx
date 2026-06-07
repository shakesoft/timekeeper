import React from "react";
import { Form } from "antd";
import { Controller, type Control } from "react-hook-form";
import { HostSettingsEditDto } from "@api/generated/service-proxies";
import L from "@/lib/L";

interface Props {
  control: Control<HostSettingsEditDto>;
}

const OtherSettingsTab: React.FC<Props> = ({ control }) => {
  return (
    <Form layout="vertical">
      <h5 className="mt-2">{L("QuickThemeSelection")}</h5>
      <Form.Item>
        <Controller
          name="otherSettings.isQuickThemeSelectEnabled"
          control={control}
          render={({ field }) => (
            <div className="form-check form-check-custom form-check-solid">
              <input
                type="checkbox"
                className="form-check-input"
                checked={field.value}
                onChange={field.onChange}
                id="isQuickThemeSelectEnabled"
              />
              <label
                className="form-check-label"
                htmlFor="isQuickThemeSelectEnabled"
              >
                {L("IsQuickThemeSelectEnabled")}
              </label>
            </div>
          )}
        />
      </Form.Item>
    </Form>
  );
};

export default OtherSettingsTab;
