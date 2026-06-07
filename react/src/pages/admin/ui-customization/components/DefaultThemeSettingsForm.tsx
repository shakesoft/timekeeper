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

const DefaultThemeSettingsForm: React.FC<Props> = ({
  initialSettings,
  canSaveAsSystemDefault,
}) => {
  const uiCustomizationSettingsService = useServiceProxy(
    UiCustomizationSettingsServiceProxy,
    [],
  );
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<ThemeSettingsDto>();
  const allowAsideMinimizing = !!Form.useWatch(
    ["menu", "allowAsideMinimizing"],
    form,
  );

  const submitAsDefault = async () => {
    const values = form.getFieldsValue(true) as ThemeSettingsDto;
    values.theme = initialSettings.theme;
    setSaving(true);
    try {
      await uiCustomizationSettingsService.updateDefaultUiManagementSettings(
        values,
      );
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
      await uiCustomizationSettingsService.updateUiManagementSettings(values);
      window.location.reload();
    } finally {
      setSaving(false);
    }
  };

  const useSystemDefaults = async () => {
    setSaving(true);
    try {
      await uiCustomizationSettingsService.useSystemDefaultSettings();
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
                      <h5 className="col">{L("UiCustomization_MenuSkin")}</h5>
                      <div className="col-lg-12">
                        <Form.Item name={["menu", "asideSkin"]} noStyle>
                          <select
                            id="AsideSkin"
                            name="AsideSkin"
                            className="form-select w-25"
                          >
                            <option value="light">
                              {L("UiCustomization_Light")}
                            </option>
                            <option value="dark">
                              {L("UiCustomization_Dark")}
                            </option>
                          </select>
                        </Form.Item>
                      </div>
                    </div>
                    <div className="mb-5 row">
                      <div className="col-lg-12">
                        <label className="form-check form-check-custom form-check-solid col-lg-12">
                          <Form.Item
                            name={["menu", "fixedAside"]}
                            valuePropName="checked"
                            noStyle
                          >
                            <input
                              type="checkbox"
                              name="FixedAside"
                              className="form-check-input"
                            />
                          </Form.Item>
                          <span className="form-check-label">
                            {L("UiCustomization_FixedMenu")}
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="mb-5 row">
                      <div className="col-lg-12">
                        <label className="form-check form-check-custom form-check-solid col-lg-12">
                          <Form.Item
                            name={["menu", "allowAsideMinimizing"]}
                            valuePropName="checked"
                            noStyle
                          >
                            <input
                              type="checkbox"
                              name="AllowAsideMinimizing"
                              className="form-check-input"
                            />
                          </Form.Item>
                          <span className="form-check-label">
                            {L("UiCustomization_AllowAsideMinimizing")}
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="mb-5 row">
                      <div className="col-lg-12">
                        <label className="form-check form-check-custom form-check-solid col-lg-12">
                          <Form.Item
                            name={["menu", "defaultMinimizedAside"]}
                            valuePropName="checked"
                            noStyle
                          >
                            <input
                              type="checkbox"
                              name="DefaultMinimizedAside"
                              className="form-check-input"
                              disabled={!allowAsideMinimizing}
                            />
                          </Form.Item>
                          <span className="form-check-label">
                            {L("UiCustomization_DefaultMinimizedAside")}
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="mb-5 row">
                      <div className="col-lg-12">
                        <label className="form-check form-check-custom form-check-solid col-lg-12">
                          <Form.Item
                            name={["menu", "hoverableAside"]}
                            valuePropName="checked"
                            noStyle
                          >
                            <input
                              type="checkbox"
                              name="HoverableAside"
                              className="form-check-input"
                            />
                          </Form.Item>
                          <span className="form-check-label">
                            {L("UiCustomization_HoverableAside")}
                          </span>
                        </label>
                      </div>
                    </div>
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
              key: "toolbar",
              label: L("UiCustomization_Toolbar"),
              children: (
                <div className="mb-10">
                  <div className="row">
                    <div className="mb-5 row">
                      <div className="col-lg-12">
                        <label className="form-check form-check-custom form-check-solid col-lg-12">
                          <Form.Item
                            name={["toolbar", "desktopFixedToolbar"]}
                            valuePropName="checked"
                            noStyle
                          >
                            <input
                              type="checkbox"
                              name="DesktopFixedHeader"
                              className="form-check-input"
                            />
                          </Form.Item>
                          <span className="form-check-label">
                            {L("UiCustomization_Toolbar_DesktopFixedHeader")}
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="mb-5 row">
                      <div className="col-lg-12">
                        <label className="form-check form-check-custom form-check-solid col-lg-12">
                          <Form.Item
                            name={["toolbar", "mobileFixedToolbar"]}
                            valuePropName="checked"
                            noStyle
                          >
                            <input
                              type="checkbox"
                              name="MobileFixedHeader"
                              className="form-check-input"
                            />
                          </Form.Item>
                          <span className="form-check-label">
                            {L("UiCustomization_Toolbar_MobileFixedHeader")}
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
                      <div className="col-lg-12">
                        <label className="form-check form-check-custom form-check-solid col-lg-12">
                          <Form.Item
                            name={["footer", "desktopFixedFooter"]}
                            valuePropName="checked"
                            noStyle
                          >
                            <input
                              type="checkbox"
                              name="DesktopFixedFooter"
                              className="form-check-input"
                            />
                          </Form.Item>
                          <span className="form-check-label">
                            {L("UiCustomization_DesktopFixedFooter")}
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="mb-5 row">
                      <div className="col-lg-12">
                        <label className="form-check form-check-custom form-check-solid col-lg-12">
                          <Form.Item
                            name={["footer", "mobileFixedFooter"]}
                            valuePropName="checked"
                            noStyle
                          >
                            <input
                              type="checkbox"
                              name="MobileFixedFooter"
                              className="form-check-input"
                            />
                          </Form.Item>
                          <span className="form-check-label">
                            {L("UiCustomization_MobileFixedFooter")}
                          </span>
                        </label>
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

export default DefaultThemeSettingsForm;
