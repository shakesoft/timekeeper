import React, { useState } from "react";
import { Tabs } from "antd";
import ChangeLogsTab from "./components/ChangeLogsTab";
import AuditLogDetailModal from "./components/AuditLogDetailModal";
import OperationLogsTab from "./components/OperationLogsTab";
import EntityChangeDetailModal from "./components/EntityChangeDetailModal";
import type {
  AuditLogListDto,
  EntityChangeListDto,
} from "../../../api/generated/service-proxies";
import PageHeader from "../components/common/PageHeader";
import L from "@/lib/L";
import { useTheme } from "@/hooks/useTheme";

const AuditLogsPage: React.FC = () => {
  const [isAuditLogModalVisible, setIsAuditLogModalVisible] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] =
    useState<AuditLogListDto | null>(null);

  const [isEntityChangeModalVisible, setIsEntityChangeModalVisible] =
    useState(false);
  const [selectedEntityChange, setSelectedEntityChange] =
    useState<EntityChangeListDto | null>(null);
  const { containerClass } = useTheme();

  const showAuditLogDetails = (record: AuditLogListDto) => {
    setSelectedAuditLog(record);
    setIsAuditLogModalVisible(true);
  };

  const showEntityChangeDetails = (record: EntityChangeListDto) => {
    setSelectedEntityChange(record);
    setIsEntityChangeModalVisible(true);
  };

  const tabItems = [
    {
      key: "1",
      label: L("OperationLogs"),
      children: <OperationLogsTab showAuditLogDetails={showAuditLogDetails} />,
    },
    {
      key: "2",
      label: L("ChangeLogs"),
      children: (
        <ChangeLogsTab showEntityChangeDetails={showEntityChangeDetails} />
      ),
    },
  ];

  return (
    <>
      <PageHeader title={L("AuditLogs")} />
      <div className={containerClass}>
        <div className="card card-body">
          <Tabs defaultActiveKey="1" items={tabItems} />
        </div>

        <AuditLogDetailModal
          isVisible={isAuditLogModalVisible}
          onClose={() => setIsAuditLogModalVisible(false)}
          record={selectedAuditLog}
        />

        <EntityChangeDetailModal
          isVisible={isEntityChangeModalVisible}
          onClose={() => setIsEntityChangeModalVisible(false)}
          record={selectedEntityChange}
        />
      </div>
    </>
  );
};

export default AuditLogsPage;
