import React from "react";
import { Form } from "antd";
import { Controller, type Control } from "react-hook-form";
import { HostSettingsEditDto } from "@api/generated/service-proxies";
import L from "@/lib/L";

interface Props {
  control: Control<HostSettingsEditDto>;
}

const InvoiceSettingsTab: React.FC<Props> = ({ control }) => {
  return (
    <Form layout="vertical">
      <h5 className="my-3">{L("InvoiceInformation")}</h5>
      <Form.Item className="mb-5" label={L("LegalName")}>
        <Controller
          name="billing.legalName"
          control={control}
          render={({ field }) => (
            <input type="text" {...field} className="form-control" />
          )}
        />
      </Form.Item>
      <Form.Item className="mb-5" label={L("Address")}>
        <Controller
          name="billing.address"
          control={control}
          render={({ field }) => (
            <textarea rows={5} {...field} className="form-control" />
          )}
        />
      </Form.Item>
    </Form>
  );
};

export default InvoiceSettingsTab;
