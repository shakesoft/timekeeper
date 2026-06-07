import React from "react";
import { Tabs } from "antd";
import PageHeader from "../components/common/PageHeader";
import PropertiesTab from "./components/PropertiesTab";
import EntityPropertiesTab from "./dynamic-entity-properties/components/DynamicEntityPropertyList";
import L from "@/lib/L";
import { useTheme } from "@/hooks/useTheme";

const DynamicPropertyManagementPage: React.FC = () => {
  const { containerClass } = useTheme();

  const items = [
    {
      key: "1",
      label: L("DynamicProperties"),
      children: <PropertiesTab />,
    },
    {
      key: "2",
      label: L("DynamicEntityProperties"),
      children: <EntityPropertiesTab />,
    },
  ];

  return (
    <>
      <PageHeader title={L("DynamicPropertyManagement")} />
      <div className={containerClass}>
        <div className="card card-body">
          <Tabs defaultActiveKey="1" items={items} />
        </div>
      </div>
    </>
  );
};

export default DynamicPropertyManagementPage;
