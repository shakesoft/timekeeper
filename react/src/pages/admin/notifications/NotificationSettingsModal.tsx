import { forwardRef, useImperativeHandle, useState } from "react";
import { Modal, Switch, Checkbox } from "antd";
import {
  GetNotificationSettingsOutput,
  NotificationServiceProxy,
  NotificationSubscriptionDto,
  NotificationSubscriptionWithDisplayNameDto,
  UpdateNotificationSettingsInput,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@api/service-proxy-factory";
import L from "@/lib/L";

export type NotificationSettingsModalHandle = {
  show: () => void;
};

const NotificationSettingsModal = forwardRef<NotificationSettingsModalHandle>(
  (_props, ref) => {
    const notificationService = useServiceProxy(NotificationServiceProxy, []);
    const [visible, setVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] =
      useState<GetNotificationSettingsOutput | null>(null);

    const load = async () => {
      const result = await notificationService.getNotificationSettings();
      setSettings(result);
      setVisible(true);
    };

    useImperativeHandle(ref, () => ({
      show: () => {
        void load();
      },
    }));

    const save = async () => {
      if (!settings) return;
      setSaving(true);
      const input = {
        receiveNotifications: settings.receiveNotifications,
        notifications: (settings.notifications || []).map((n) => {
          const dto = new NotificationSubscriptionDto();
          dto.name = n.name;
          dto.isSubscribed = n.isSubscribed;
          return dto;
        }),
      } as UpdateNotificationSettingsInput;
      await notificationService.updateNotificationSettings(input);
      setSaving(false);
      abp?.notify?.info?.(L("SavedSuccessfully"));
      setVisible(false);
    };

    return (
      <Modal
        title={L("NotificationSettings")}
        open={visible}
        onCancel={() => setVisible(false)}
        destroyOnHidden
        width={720}
        footer={
          <>
            <button
              type="button"
              className="btn btn-light-primary fw-bold"
              onClick={() => setVisible(false)}
              disabled={saving}
            >
              {L("Cancel")}
            </button>
            <button
              type="button"
              className="btn btn-primary fw-bold d-inline-flex align-items-center"
              onClick={() => void save()}
              disabled={saving}
            >
              <i className="fa fa-save me-2" />
              <span>{L("Save")}</span>
              {saving && (
                <span className="spinner-border spinner-border-sm align-middle ms-2" />
              )}
            </button>
          </>
        }
      >
        {settings && (
          <div>
            <h4>{L("ReceiveNotifications")}</h4>
            <div className="form-check form-check-custom form-check-solid form-switch py-1 mb-3">
              <Switch
                checked={settings.receiveNotifications}
                onChange={(checked) =>
                  setSettings(
                    Object.assign(new GetNotificationSettingsOutput(settings), {
                      receiveNotifications: checked,
                    }),
                  )
                }
              />
              <span className="form-check-label ml-3">
                ({L("ReceiveNotifications_Definition")})
              </span>
            </div>
            {(settings.notifications?.length || 0) > 0 && (
              <h4 className="mt-4">{L("NotificationTypes")}</h4>
            )}
            {(settings.notifications?.length || 0) > 0 &&
              !settings.receiveNotifications && (
                <p className="text-danger">
                  <small>{L("ReceiveNotifications_DisableInfo")}</small>
                </p>
              )}
            {(settings.notifications || []).map((n) => (
              <label
                key={n.name}
                className="form-check form-check-custom form-check-solid py-1 d-block"
              >
                <Checkbox
                  checked={n.isSubscribed}
                  onChange={(e) => {
                    const clone = new GetNotificationSettingsOutput(settings);
                    clone.notifications = (clone.notifications || []).map(
                      (m) => {
                        if (m.name === n.name) {
                          const dto =
                            new NotificationSubscriptionWithDisplayNameDto(m);
                          dto.isSubscribed = e.target.checked;
                          return dto;
                        }
                        return m;
                      },
                    );
                    setSettings(clone);
                  }}
                  disabled={!settings.receiveNotifications}
                />
                <span className="form-check-label ml-2">
                  {n.displayName}
                  {n.description && (
                    <span className="help-block ml-2">{n.description}</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        )}
      </Modal>
    );
  },
);

export default NotificationSettingsModal;
