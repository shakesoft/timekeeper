import React from "react";
import { Tabs, App } from "antd";
import { NotificationServiceProxy } from "@api/generated/service-proxies";
import { usePermissions } from "../../../hooks/usePermissions";
import PageHeader from "../components/common/PageHeader";
import CachesTab from "./components/CachesTab";
import WebLogsTab from "./components/WebLogsTab";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useTheme } from "@/hooks/useTheme";
const MaintenancePage: React.FC = () => {
  const { isGranted } = usePermissions();
  const notificationService = useServiceProxy(NotificationServiceProxy, []);
  const { modal } = App.useApp();
  const { containerClass } = useTheme();
  const sendNewVersionNotification = () => {
    modal.confirm({
      title: L("AreYouSure"),
      content: L("SendNewVersionNotificationWarningMessage"),
      onOk: async () => {
        await notificationService.createNewVersionReleasedNotification();
        abp.notify.info(L("SuccessfullySentNewVersionNotification"));
      },
    });
  };

  const items = [
    { key: "1", label: L("Caches"), children: <CachesTab /> },
    { key: "2", label: L("WebSiteLogs"), children: <WebLogsTab /> },
  ];

  return (
    <>
      <PageHeader
        title={L("Maintenance")}
        actions={
          isGranted("Pages.Administration.NewVersion.Create") && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={sendNewVersionNotification}
            >
              {L("SendNewVersionNotification")}
            </button>
          )
        }
      />
      <div className={containerClass}>
        <div className="card card-body">
          <Tabs defaultActiveKey="1" items={items} />
        </div>
      </div>
    </>
  );
};

export default MaintenancePage;
