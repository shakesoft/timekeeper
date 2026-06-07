import React from "react";
import { Form } from "antd";
import { Controller, type Control } from "react-hook-form";
import { TenantSettingsEditDto } from "@api/generated/service-proxies";
import L from "@/lib/L";

interface Props {
  control: Control<TenantSettingsEditDto>;
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
            <textarea {...field} className="form-control" rows={5} />
          )}
        />
      </Form.Item>
      <Form.Item className="mb-5" label={L("Tax/VatNo")}>
        <Controller
          name="billing.taxVatNo"
          control={control}
          render={({ field }) => (
            <input type="text" {...field} className="form-control" />
          )}
        />
      </Form.Item>
    </Form>
  );
};

export default InvoiceSettingsTab;
