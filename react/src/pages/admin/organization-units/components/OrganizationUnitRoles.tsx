import React, { useState, useCallback, useEffect } from "react";
import { Table, App } from "antd";
import {
  OrganizationUnitServiceProxy,
  OrganizationUnitRoleListDto,
} from "@api/generated/service-proxies";
import { useDataTable } from "../../../../hooks/useDataTable";
import { usePermissions } from "../../../../hooks/usePermissions";
import { formatDate } from "../../components/common/timing/lib/datetime-helper";
import type { IBasicOrganizationUnitInfo } from "../types";
import AddRoleModal from "./AddRoleModal";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import AppConsts from "@/lib/app-consts";

interface Props {
  organizationUnit: IBasicOrganizationUnitInfo | null;
  onRoleChanged: () => void;
}

const OrganizationUnitRoles: React.FC<Props> = ({
  organizationUnit,
  onRoleChanged,
}) => {
  const { isGranted } = usePermissions();
  const organizationUnitService = useServiceProxy(
    OrganizationUnitServiceProxy,
    [],
  );
  const { modal } = App.useApp();
  const [isAddRoleModalVisible, setAddRoleModalVisible] = useState(false);

  const fetchFunction = useCallback(
    (skipCount: number, maxResultCount: number, sorting: string) => {
      if (!organizationUnit?.id) {
        return Promise.resolve({ items: [], totalCount: 0 });
      }
      return organizationUnitService.getOrganizationUnitRoles(
        organizationUnit.id,
        sorting,
        skipCount,
        maxResultCount,
      );
    },
    [organizationUnit, organizationUnitService],
  );

  const { records, loading, pagination, handleTableChange, fetchData } =
    useDataTable<OrganizationUnitRoleListDto>(fetchFunction);

  useEffect(() => {
    if (organizationUnit?.id) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationUnit]);

  const removeRole = (role: OrganizationUnitRoleListDto) => {
    modal.confirm({
      title: L("AreYouSure"),
      content: L("RemoveRoleFromOuWarningMessage", {
        0: role.displayName ?? "",
        1: organizationUnit?.displayName ?? "",
      }),
      onOk: async () => {
        await organizationUnitService.removeRoleFromOrganizationUnit(
          role.id!,
          organizationUnit!.id!,
        );
        onRoleChanged();
        fetchData();
      },
    });
  };

  const canManageRoles = isGranted(
    "Pages.Administration.OrganizationUnits.ManageRoles",
  );

  const columns = [
    ...(canManageRoles
      ? [
          {
            title: L("Delete"),
            width: "15%",
            render: (_text: string, record: OrganizationUnitRoleListDto) => (
              <button
                className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
                onClick={() => removeRole(record)}
                title={L("Delete")}
              >
                <i className="fa fa-times" aria-label={L("Delete")}></i>
              </button>
            ),
          },
        ]
      : []),
    {
      title: L("Role"),
      dataIndex: "displayName",
      sorter: true,
    },
    {
      title: L("AddedTime"),
      dataIndex: "addedTime",
      render: (text: string) =>
        formatDate(text, AppConsts.timing.shortDateFormat),
      sorter: true,
    },
  ];

  if (!organizationUnit) {
    return (
      <div className="text-muted p-4">
        {L("SelectAnOrganizationUnitToSeeRoles")}
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-12 p-3">
        {canManageRoles && (
          <button
            className="btn btn-outline btn-outline-primary btn-sm float-end mb-3"
            onClick={() => setAddRoleModalVisible(true)}
          >
            <i className="fa fa-plus"></i> {L("AddRole")}
          </button>
        )}
      </div>
      <div className="col-12">
        <Table
          dataSource={records}
          columns={columns}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          rowKey="id"
        />
      </div>
      <AddRoleModal
        isVisible={isAddRoleModalVisible}
        onClose={() => setAddRoleModalVisible(false)}
        onSave={() => {
          fetchData();
          onRoleChanged();
        }}
        organizationUnitId={organizationUnit.id}
      />
    </div>
  );
};

export default OrganizationUnitRoles;
