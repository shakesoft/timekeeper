import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Dropdown, App } from "antd";
import type { MenuProps } from "antd";
import {
  RoleListDto,
  RoleServiceProxy,
  GetRolesInput,
} from "@api/generated/service-proxies";
import { usePermissions } from "../../../hooks/usePermissions";
import PageHeader from "../components/common/PageHeader";
import CreateOrEditRoleModal from "./components/CreateOrEditRoleModal";
import { formatDate } from "../components/common/timing/lib/datetime-helper";
import PermissionTreeModal from "../components/common/trees/PermissionTreeModal";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useTheme } from "@/hooks/useTheme";
import AppConsts from "@/lib/app-consts";

const RolesPage: React.FC = () => {
  const { isGranted, isGrantedAny } = usePermissions();
  const navigate = useNavigate();
  const roleService = useServiceProxy(RoleServiceProxy, []);
  const { modal } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<RoleListDto[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | undefined>();
  const [entityHistoryEnabled, setEntityHistoryEnabled] = useState(false);
  const [isPermissionTreeModalVisible, setIsPermissionTreeModalVisible] =
    useState(false);
  const { containerClass } = useTheme();

  useEffect(() => {
    const applyEntityHistoryFlag = () => {
      try {
        const isEnabled = !!(
          abp as { custom?: { EntityHistory?: { IsEnabled?: boolean } } }
        )?.custom?.EntityHistory?.IsEnabled;
        setEntityHistoryEnabled(isEnabled);
      } catch {
        setEntityHistoryEnabled(false);
      }
    };
    applyEntityHistoryFlag();
    const handler = () => applyEntityHistoryFlag();
    abp?.event?.on?.("abp.userConfigLoaded", handler);

    return () => {
      abp?.event?.off?.("abp.userConfigLoaded", handler);
    };
  }, []);
  const fetchRoles = useCallback(
    async (permissions: string[] = []) => {
      setLoading(true);
      try {
        const result = await roleService.getRoles(
          new GetRolesInput({ permissions: permissions }),
        );
        setRoles(result.items ?? []);
      } finally {
        setLoading(false);
      }
    },
    [roleService],
  );

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const deleteRole = (role: RoleListDto) => {
    modal.confirm({
      title: L("AreYouSure"),
      content: L("RoleDeleteWarningMessage", role.displayName),
      onOk: async () => {
        await roleService.deleteRole(role.id!);
        abp.notify.success(L("SuccessfullyDeleted"));
        fetchRoles();
      },
    });
  };

  const showHistory = (role: RoleListDto) => {
    const entityTypeFullName =
      "CadentManagement.Authorization.Roles.Role";
    navigate(`/app/admin/entity-changes/${entityTypeFullName}/${role.id}`);
  };

  const getMenuItems = (record: RoleListDto): MenuProps => {
    const items: MenuProps["items"] = [];
    if (isGranted("Pages.Administration.Roles.Edit")) {
      items.push({
        key: "edit",
        label: L("Edit"),
        onClick: () => {
          setEditingRoleId(record.id);
          setIsModalVisible(true);
        },
      });
    }
    if (!record.isStatic && isGranted("Pages.Administration.Roles.Delete")) {
      items.push({
        key: "delete",
        label: L("Delete"),
        onClick: () => deleteRole(record),
        danger: true,
      });
    }
    if (entityHistoryEnabled) {
      items.push({
        key: "history",
        label: L("History"),
        onClick: () => showHistory(record),
      });
    }

    return { items };
  };

  const columns = [
    {
      title: L("Actions"),
      width: 130,
      align: "center" as const,
      hidden:
        !isGrantedAny(
          "Pages.Administration.Roles.Edit",
          "Pages.Administration.Roles.Delete",
        ) && !entityHistoryEnabled,
      render: (_text: string, record: RoleListDto) => (
        <Dropdown
          menu={getMenuItems(record)}
          trigger={["click"]}
          placement="bottomLeft"
        >
          <button
            type="button"
            className="btn btn-primary btn-sm dropdown-toggle d-flex align-items-center"
          >
            <i className="fa fa-cog"></i>
            <span className="ms-2">{L("Actions")}</span>
            <span className="caret ms-1"></span>
          </button>
        </Dropdown>
      ),
    },
    {
      title: L("RoleName"),
      dataIndex: "displayName",
      render: (text: string, record: RoleListDto) => (
        <span>
          {text}
          {record.isStatic && (
            <span
              className="badge badge-primary m-1"
              title={L("StaticRole_Tooltip")}
            >
              {L("Static")}
            </span>
          )}
          {record.isDefault && (
            <span
              className="badge badge-dark m-1"
              title={L("DefaultRole_Description")}
            >
              {L("Default")}
            </span>
          )}
        </span>
      ),
    },
    {
      title: L("CreationTime"),
      dataIndex: "creationTime",
      render: (text: string) =>
        formatDate(text, AppConsts.timing.longDateFormat),
    },
  ];

  return (
    <div>
      <PageHeader
        title={L("Roles")}
        description={L("RolesHeaderInfo")}
        actions={
          isGranted("Pages.Administration.Roles.Create") && (
            <button
              type="button"
              className="btn btn-primary d-flex align-items-center"
              onClick={() => {
                setEditingRoleId(undefined);
                setIsModalVisible(true);
              }}
            >
              <i className="fa fa-plus btn-md-icon"></i>
              <span className="d-none d-md-inline-block">
                {" "}
                {L("CreateNewRole")}
              </span>
            </button>
          )
        }
      />
      <div className={containerClass}>
        <div className="card card-custom">
          <div className="card-body">
            <div className="form">
              <div className="row">
                <div className="col-6">
                  <div className="mb-5">
                    <PermissionTreeModal
                      isVisible={isPermissionTreeModalVisible}
                      onClose={() => setIsPermissionTreeModalVisible(false)}
                      onSave={fetchRoles}
                    />
                  </div>
                </div>
                <div className="col-6 text-end mb-3">
                  <button
                    name="RefreshButton"
                    className="btn btn-primary float-end"
                    onClick={() => void fetchRoles()}
                  >
                    <i className="la la-refresh btn-md-icon"></i>
                    <span className="d-none d-md-inline-block">
                      {" "}
                      {L("Refresh")}
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="row align-items-center">
              <Table
                dataSource={roles}
                columns={columns}
                loading={loading}
                rowKey="id"
              />
            </div>
          </div>
        </div>
      </div>
      <CreateOrEditRoleModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={fetchRoles}
        roleId={editingRoleId}
      />
    </div>
  );
};
export default RolesPage;
