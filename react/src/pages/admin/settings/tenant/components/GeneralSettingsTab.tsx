import React, { useEffect, useState } from "react";
import { Form, Select } from "antd";
import { Controller, type Control } from "react-hook-form";
import {
  TenantSettingsEditDto,
  TimingServiceProxy,
  ListResultDtoOfNameValueDto,
  SettingScopes,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

interface Props {
  control: Control<TenantSettingsEditDto>;
}

const GeneralSettingsTab: React.FC<Props> = ({ control }) => {
  const timingService = useServiceProxy(TimingServiceProxy, []);
  const [timezones, setTimezones] =
    useState<ListResultDtoOfNameValueDto | null>(null);

  useEffect(() => {
    timingService
      .getTimezones(SettingScopes.Tenant)
      .then((items) => setTimezones(items ?? []));
  }, [timingService]);

  return (
    <Form layout="vertical">
      <Form.Item label={L("Timezone")}>
        <Controller
          name="general.timezone"
          control={control}
          render={({ field }) => (
            <Select
              className="form-select mb-5"
              {...field}
              showSearch
              options={(timezones?.items ?? []).map((z) => ({
                label: z.name,
                value: z.value,
              }))}
            />
          )}
        />
      </Form.Item>
    </Form>
  );
};

export default GeneralSettingsTab;
