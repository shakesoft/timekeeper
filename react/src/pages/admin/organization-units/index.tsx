import React, { useState, useRef } from "react";
import { Tabs } from "antd";
import type { TabsProps } from "antd";
import PageHeader from "../components/common/PageHeader";
import type {
  IBasicOrganizationUnitInfo,
  OrganizationUnitTreeRef,
  OrganizationUnitMembersRef,
} from "./types";
import OrganizationTree from "./components/OrganizationTree";
import OrganizationUnitMembers from "./components/OrganizationUnitMembers";
import OrganizationUnitRoles from "./components/OrganizationUnitRoles";
import L from "@/lib/L";
import { useTheme } from "@/hooks/useTheme";

const OrganizationUnitsPage: React.FC = () => {
  const [selectedOu, setSelectedOu] =
    useState<IBasicOrganizationUnitInfo | null>(null);
  const [activeTab, setActiveTab] = useState<string>("members");
  const treeRef = useRef<OrganizationUnitTreeRef>(null);
  const membersRef = useRef<OrganizationUnitMembersRef>(null);
  const { containerClass } = useTheme();

  const handleOuSelect = (ou: IBasicOrganizationUnitInfo | null) => {
    setSelectedOu(ou);
    setActiveTab("members");
  };

  const handleMemberOrRoleChanged = () => {
    treeRef.current?.reload();
    membersRef.current?.reload();
  };

  const tabItems: TabsProps["items"] = [
    {
      key: "members",
      label: L("Members"),
      children: (
        <OrganizationUnitMembers
          ref={membersRef}
          organizationUnit={selectedOu}
          onMemberChanged={handleMemberOrRoleChanged}
        />
      ),
    },
    {
      key: "roles",
      label: L("Roles"),
      children: (
        <OrganizationUnitRoles
          organizationUnit={selectedOu}
          onRoleChanged={handleMemberOrRoleChanged}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={L("OrganizationUnits")}
        description={L("OrganizationUnitsHeaderInfo")}
      />
      <div className={containerClass}>
        <div className="container-fluid">
          <div className="row">
            <div className="col-6">
              <OrganizationTree ref={treeRef} onOuSelect={handleOuSelect} />
            </div>
            <div className="col-6">
              <div className="card card-custom gutter-b">
                <div className="card-header align-items-center border-0">
                  <h3 className="card-title align-items-start flex-column">
                    <span className="fw-bolder text-gray-900">
                      {selectedOu ? selectedOu.displayName : ""}
                    </span>
                  </h3>
                </div>
                <div className="card-body">
                  <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizationUnitsPage;
