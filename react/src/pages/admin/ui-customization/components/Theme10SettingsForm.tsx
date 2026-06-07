import React, { useState } from "react";
import { Form, Tabs } from "antd";
import {
  ThemeSettingsDto,
  UiCustomizationSettingsServiceProxy,
} from "../../../../api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

interface Props {
  initialSettings: ThemeSettingsDto;
  canSaveAsSystemDefault: boolean;
}

const Theme10SettingsForm: React.FC<Props> = ({
  initialSettings,
  canSaveAsSystemDefault,
}) => {
  const service = useServiceProxy(UiCustomizationSettingsServiceProxy, []);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<ThemeSettingsDto>();

  const submitAsDefault = async () => {
    const values = form.getFieldsValue(true) as ThemeSettingsDto;
    values.theme = initialSettings.theme;
    setSaving(true);
    try {
      await service.updateDefaultUiManagementSettings(values);
      window.location.reload();
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    const values = form.getFieldsValue(true) as ThemeSettingsDto;
    values.theme = initialSettings.theme;
    setSaving(true);
    try {
      await service.updateUiManagementSettings(values);
      window.location.reload();
    } finally {
      setSaving(false);
    }
  };

  const useSystemDefaults = async () => {
    setSaving(true);
    try {
      await service.useSystemDefaultSettings();
      window.location.reload();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Form form={form} layout="vertical" initialValues={initialSettings}>
        <Tabs
          items={[
            {
              key: "layout",
              label: L("UiCustomization_Layout"),
              children: (
                <div className="mb-10">
                  <div className="row">
                    <div className="mb-5 row">
                      <h5 className="col">{L("UiCustomization_Width")}</h5>
                      <div className="col-lg-12">
                        <Form.Item name={["layout", "layoutType"]} noStyle>
                          <select
                            name="LayoutType"
                            className="form-select w-25"
                          >
                            <option value="fluid">
                              {L("UiCustomization_Fluid")}
                            </option>
                            <option value="fixed">
                              {L("UiCustomization_Fixed")}
                            </option>
                          </select>
                        </Form.Item>
                      </div>
                    </div>
                    <div className="mb-5 row">
                      <div className="col-lg-12">
                        <label className="form-check form-check-custom form-check-solid col-lg-12">
                          <Form.Item
                            name={["layout", "darkMode"]}
                            valuePropName="checked"
                            noStyle
                          >
                            <input
                              type="checkbox"
                              name="DarkMode"
                              className="form-check-input"
                            />
                          </Form.Item>
                          <span className="form-check-label">
                            {L("UiCustomization_DarkMode")}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: "menu",
              label: L("UiCustomization_Menu"),
              children: (
                <div className="mb-10">
                  <div className="row">
                    <div className="mb-5 row">
                      <div className="col-lg-12">
                        <label className="form-check form-check-custom form-check-solid col-lg-12">
                          <Form.Item
                            name={["menu", "searchActive"]}
                            valuePropName="checked"
                            noStyle
                          >
                            <input
                              type="checkbox"
                              name="SearchActive"
                              className="form-check-input"
                            />
                          </Form.Item>
                          <span className="form-check-label">
                            {L("ShowMenuSearchInput")}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: "footer",
              label: L("UiCustomization_Footer"),
              children: (
                <div className="mb-10">
                  <div className="row">
                    <div className="mb-5 row">
                      <h5 className="col">{L("UiCustomization_Width")}</h5>
                      <div className="col-lg-12">
                        <Form.Item name={["footer", "footerWidthType"]} noStyle>
                          <select
                            name="footerWidthType"
                            className="form-select w-25"
                          >
                            <option value="fluid">
                              {L("UiCustomization_Fluid")}
                            </option>
                            <option value="fixed">
                              {L("UiCustomization_Fixed")}
                            </option>
                          </select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Form>

      <div className="mt-4 d-flex gap-3">
        {canSaveAsSystemDefault && (
          <button
            className="btn btn-primary"
            onClick={submitAsDefault}
            disabled={saving}
          >
            {L("SaveAsSystemDefault")}
          </button>
        )}
        {!canSaveAsSystemDefault && (
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={saving}
          >
            {L("Save")}
          </button>
        )}
        {!canSaveAsSystemDefault && (
          <button
            className="btn btn-secondary"
            onClick={useSystemDefaults}
            disabled={saving}
          >
            {L("UseSystemDefaults")}
          </button>
        )}
      </div>
    </div>
  );
};

export default Theme10SettingsForm;
