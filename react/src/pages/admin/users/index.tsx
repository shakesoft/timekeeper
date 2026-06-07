import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dropdown, Table, App } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { usePermissions } from "../../../hooks/usePermissions";
import PageHeader from "../components/common/PageHeader";
import { downloadTempFile } from "../../../lib/file-download-helper";
import {
  EntityDtoOfInt64,
  FileDto,
  GetUsersInput,
  UserListDto,
  UserServiceProxy,
  ProfileServiceProxy,
} from "@api/generated/service-proxies";
import { useDataTable } from "../../../hooks/useDataTable";
import CreateOrEditUserModal from "./components/CreateOrEditUserModal";
import EditUserPermissionsModal from "./components/EditUserPermissionsModal";
import ExcelColumnSelectionModal from "../components/common/excel-column-selection";
import PermissionTreeModal from "../components/common/trees/PermissionTreeModal";
import RoleCombo from "../components/common/RoleCombo";
import useImpersonation from "./hooks/useImpersonation";
import { useServiceProxy } from "@/api/service-proxy-factory";
import { formatDate } from "../components/common/timing/lib/datetime-helper";
import L from "@/lib/L";
import AppConsts from "@/lib/app-consts";
import { apiHttp } from "@api/http-client";
import { useTheme } from "@/hooks/useTheme";
import { useDynamicEntityPropertyManager } from "@/hooks/useDynamicEntityPropertyManager";
import ManageValuesModal from "../dynamic-properties/dynamic-entity-property-values/components/ManageValuesModal";

const UsersPage: React.FC = () => {
  const { isGranted } = usePermissions();
  const userService = useServiceProxy(UserServiceProxy, []);
  const profileService = useServiceProxy(ProfileServiceProxy, []);
  const { impersonateUser } = useImpersonation();
  const {
    canShow: canShowDynamicProperties,
    dynamicPropsModal,
    openDynamicPropsModal,
    closeDynamicPropsModal,
  } = useDynamicEntityPropertyManager();

  const userEntityFullName =
    "CadentManagement.Authorization.Users.User";

  const [filterText, setFilterText] = useState("");
  const [onlyLockedUsers, setOnlyLockedUsers] = useState(false);
  const [role, setRole] = useState<number | undefined>();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [advancedFiltersAreShown, setAdvancedFiltersAreShown] = useState(false);

  const [excelColumnModalOpen, setExcelColumnModalOpen] = useState(false);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);

  const [profilePictures, setProfilePictures] = useState<Map<number, string>>(
    new Map(),
  );
  const profilePictureCache = useRef<Map<number, string>>(new Map());
  const { containerClass } = useTheme();
  const { modal } = App.useApp();
  const fetchFn = useCallback(
    (skipCount: number, maxResultCount: number, sorting: string) => {
      const input = new GetUsersInput({
        filter: filterText,
        permissions,
        role,
        onlyLockedUsers,
        sorting,
        maxResultCount,
        skipCount,
      });
      return userService.getUsers(input);
    },
    [filterText, permissions, role, onlyLockedUsers, userService],
  );

  const { records, loading, pagination, handleTableChange, fetchData } =
    useDataTable<UserListDto>(fetchFn);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadProfilePictures = async () => {
      const newPictures = new Map(profilePictureCache.current);

      for (const record of records) {
        if (
          record.id &&
          record.profilePictureId &&
          !newPictures.has(record.id)
        ) {
          const result = await profileService.getProfilePictureByUser(
            record.id,
          );

          if (result?.profilePicture) {
            const base64Image = `data:image/jpeg;base64,${result.profilePicture}`;
            newPictures.set(record.id, base64Image);
          }
        }
      }

      profilePictureCache.current = newPictures;
      setProfilePictures(new Map(newPictures));
    };

    if (records.length > 0) {
      void loadProfilePictures();
    }
  }, [records, profileService]);

  const [createVisible, setCreateVisible] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | undefined>();
  const [permModal, setPermModal] = useState<{
    visible: boolean;
    userId?: number;
    userName?: string;
  }>({ visible: false });

  const unlockUser = async (record: UserListDto) => {
    const dto = new EntityDtoOfInt64();
    dto.id = record.id;
    await userService.unlockUser(dto);
    fetchData();
  };

  const deleteUser = (record: UserListDto) => {
    modal.confirm({
      title: L("AreYouSure"),
      content: L("UserDeleteWarningMessage", record.userName),
      onOk: async () => {
        await userService.deleteUser(record.id);
        fetchData();
      },
    });
  };

  const getRolesAsString = (roles: UserListDto["roles"]): string => {
    return (roles || [])
      .map((r) => r.roleName)
      .filter(Boolean)
      .join(", ");
  };

  const showExcelColumnsSelectionModal = async () => {
    const columns = await userService.getUserExcelColumnsToExcel();
    setExcelColumns(columns);
    setExcelColumnModalOpen(true);
  };

  const exportToExcel = async (selectedColumns: string[]) => {
    const file: FileDto = await userService.getUsersToExcel(
      filterText,
      permissions,
      selectedColumns,
      role,
      onlyLockedUsers,
      "",
    );
    downloadTempFile(file);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const ImportFromExcel = () => {
    fileInputRef.current?.click();
  };

  const handleImportFromExcelFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const http = apiHttp();

    // TODO: handle errors and show messages
    // We need a proper way to get abpResponse when using http client directly
    await http.post(
      `${AppConsts.remoteServiceBaseUrl}/Users/ImportFromExcel`,
      formData,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      },
    );

    abp.notify.success(L("ImportUsersProcessStart"));
    e.target.value = "";
  };

  const getMenuItems = (record: UserListDto) => {
    const items: {
      key: string;
      label: string;
      onClick: () => void;
      danger?: boolean;
    }[] = [];

    if (
      isGranted("Pages.Administration.Users.Impersonation") &&
      record.id !== abp?.session?.userId
    ) {
      items.push({
        key: "impersonate",
        label: L("LoginAsThisUser")!,
        onClick: () => impersonateUser(record.id!, abp?.session?.tenantId),
      });
    }

    if (isGranted("Pages.Administration.Users.Edit")) {
      items.push({
        key: "edit",
        label: L("Edit")!,
        onClick: () => {
          setEditingUserId(record.id);
          setCreateVisible(true);
        },
      });
    }

    if (isGranted("Pages.Administration.Users.ChangePermissions")) {
      items.push({
        key: "permissions",
        label: L("Permissions")!,
        onClick: () =>
          setPermModal({
            visible: true,
            userId: record.id,
            userName: record.userName || "",
          }),
      });
    }

    if (
      record.lockoutEndDateUtc &&
      isGranted("Pages.Administration.Users.Unlock")
    ) {
      items.push({
        key: "unlock",
        label: L("Unlock")!,
        onClick: () => unlockUser(record),
      });
    }

    if (canShowDynamicProperties(userEntityFullName)) {
      items.push({
        key: "dynamicProperties",
        label: L("DynamicProperties")!,
        onClick: () =>
          openDynamicPropsModal(userEntityFullName, record.id!.toString()),
      });
    }

    if (isGranted("Pages.Administration.Users.Delete")) {
      items.push({
        key: "delete",
        label: L("Delete")!,
        onClick: () => deleteUser(record),
        danger: true,
      });
    }

    return items;
  };

  const isUserLocked = (record: UserListDto): boolean => {
    return !!record.lockoutEndDateUtc;
  };

  const getProfilePictureUrl = (userId?: number): string => {
    if (userId && profilePictures.has(userId)) {
      return profilePictures.get(userId)!;
    }

    return "/assets/common/images/default-profile-picture.png";
  };

  const columns: ColumnsType<UserListDto> = [
    {
      title: L("Actions"),
      key: "actions",
      width: 130,
      render: (_, record) => {
        const items = getMenuItems(record);
        if (items.length === 0) return null;

        return (
          <Dropdown menu={{ items }} trigger={["click"]} placement="bottomLeft">
            <button
              type="button"
              className="btn btn-primary btn-sm dropdown-toggle d-flex align-items-center"
            >
              <i className="fa fa-cog"></i>
              <span className="ms-2">{L("Actions")}</span>
              <span className="caret ms-1"></span>
            </button>
          </Dropdown>
        );
      },
    },
    {
      title: L("UserName"),
      dataIndex: "userName",
      sorter: true,
      width: 150,
      render: (text: string, record: UserListDto) => {
        const profilePictureUrl = getProfilePictureUrl(record.id);
        const defaultPictureUrl =
          "/assets/common/images/default-profile-picture.png";

        return (
          <div className="d-flex align-items-center">
            <a
              href={profilePictureUrl}
              target="_blank"
              rel="noreferrer"
              className="me-2"
            >
              <img
                src={profilePictureUrl}
                alt=""
                className="rounded-circle"
                style={{ width: "32px", height: "32px", objectFit: "cover" }}
                onError={(e) => {
                  e.currentTarget.src = defaultPictureUrl;
                }}
              />
            </a>
            <span>
              {text}
              {isUserLocked(record) && <i className="fas fa-lock ms-2"></i>}
            </span>
          </div>
        );
      },
    },
    { title: L("Name"), dataIndex: "name", sorter: true, width: 150 },
    { title: L("Surname"), dataIndex: "surname", sorter: true, width: 150 },
    {
      title: L("Roles"),
      key: "roles",
      width: 150,
      render: (_, r) => getRolesAsString(r.roles),
    },
    {
      title: L("EmailAddress"),
      dataIndex: "emailAddress",
      sorter: true,
      width: 250,
    },
    {
      title: L("EmailConfirm"),
      dataIndex: "isEmailConfirmed",
      sorter: true,
      width: 200,
      render: (v: boolean) =>
        v ? (
          <span className="badge badge-success">{L("Yes")}</span>
        ) : (
          <span className="badge badge-dark">{L("No")}</span>
        ),
    },
    {
      title: L("Active"),
      dataIndex: "isActive",
      sorter: true,
      width: 100,
      render: (v: boolean) =>
        v ? (
          <span className="badge badge-success">{L("Yes")}</span>
        ) : (
          <span className="badge badge-dark">{L("No")}</span>
        ),
    },
    {
      title: L("CreationTime"),
      dataIndex: "creationTime",
      sorter: true,
      width: 200,
      render: (creationTime?: string) =>
        creationTime
          ? formatDate(creationTime, AppConsts.timing.longDateFormat)
          : "-",
    },
  ];

  return (
    <>
      <PageHeader
        title={L("Users")}
        description={L("UsersHeaderInfo")}
        actions={
          <div className="d-flex gap-2">
            <div className="btn-group">
              <button
                type="button"
                className="btn btn-outline btn-outline-success btn-active-light-success dropdown-toggle me-1"
                aria-haspopup="true"
                aria-expanded="false"
                data-kt-menu-trigger="click"
                data-kt-menu-attach="parent"
                data-kt-menu-placement="bottom-end"
              >
                <i className="far fa-file-excel btn-md-icon"></i>
                <span className="d-none d-md-inline-block ms-2">
                  {L("ExcelOperations")}
                </span>
              </button>

              <div
                className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-primary fw-bold fs-7 w-200px py-4"
                data-kt-menu="true"
                role="menu"
              >
                <div className="menu-item px-3" role="menuitem">
                  <a
                    href="#"
                    className="menu-link px-3 text-gray-900"
                    data-kt-menu-dismiss="true"
                    onClick={(e) => {
                      e.preventDefault();
                      showExcelColumnsSelectionModal();
                    }}
                  >
                    <i
                      className="fa fa-download me-2 mt-1 text-gray-900"
                      style={{ fontSize: "1rem" }}
                    ></i>
                    {L("ExportToExcel")}
                  </a>
                </div>

                {isGranted("Pages.Administration.Users.Create") && (
                  <>
                    <div className="menu-item px-3" role="menuitem">
                      <a
                        href="#"
                        className="menu-link px-3 text-gray-900"
                        data-kt-menu-dismiss="true"
                        onClick={(e) => {
                          e.preventDefault();
                          ImportFromExcel();
                        }}
                      >
                        <i
                          className="fa fa-upload me-2 mt-1 text-gray-900"
                          style={{ fontSize: "1rem" }}
                        ></i>
                        {L("ImportFromExcel")}
                      </a>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleImportFromExcelFileChange}
                      />
                    </div>

                    <div className="separator my-1"></div>

                    <div className="menu-item px-3" role="menuitem">
                      <span className="menu-content text-muted px-3">
                        <small
                          dangerouslySetInnerHTML={{
                            __html: L("ImportToExcelSampleFileDownloadInfo", [
                              `<a href="/assets/sampleFiles/ImportUsersSampleFile.xlsx">${L(
                                "ClickHere",
                              )}</a>`,
                            ]),
                          }}
                        />
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            {isGranted("Pages.Administration.Users.Create") && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setEditingUserId(undefined);
                  setCreateVisible(true);
                }}
              >
                <i className="fa fa-plus btn-md-icon"></i>
                <span className="d-none d-md-inline-block ms-2">
                  {L("CreateNewUser")}
                </span>
              </button>
            )}
          </div>
        }
      />

      <div className={containerClass}>
        <div className="container-fluid">
          <div className="card card-custom gutter-b">
            <div className="card-body">
              <form
                className="form"
                autoComplete="new-password"
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchData();
                }}
              >
                <div>
                  <div className="row align-items-center mb-4">
                    <div className="col-xl-12">
                      <div className="mb-5 m-form__group align-items-center">
                        <div className="input-group">
                          <input
                            value={filterText}
                            name="filterText"
                            autoFocus
                            className="form-control m-input"
                            placeholder={L("SearchWithThreeDot")!}
                            type="text"
                            onChange={(e) => setFilterText(e.target.value)}
                          />
                          <button className="btn btn-primary" type="submit">
                            <i
                              className="flaticon-search-1"
                              aria-label={L("Search")!}
                            ></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {advancedFiltersAreShown && (
                    <div className="row mb-4">
                      <div
                        className={
                          isGranted("Pages.Administration.Roles")
                            ? "col-md-6"
                            : "col-md-12"
                        }
                      >
                        <div className="mb-5">
                          <PermissionTreeModal
                            isVisible={false}
                            onClose={() => {}}
                            onSave={(perms) => {
                              setPermissions(perms);
                              fetchData();
                            }}
                            dontAddOpenerButton={false}
                          />
                        </div>
                      </div>
                      {isGranted("Pages.Administration.Roles") && (
                        <div className="col-md-6">
                          <div className="mb-5">
                            <RoleCombo
                              value={role}
                              onChange={(val) => setRole(val)}
                            />
                          </div>
                        </div>
                      )}
                      <div className="col-md-6">
                        <label className="form-check form-check-custom form-check-solid form-switch py-1">
                          <input
                            id="UsersTable_OnlyLockedUsers"
                            type="checkbox"
                            name="OnlyLockedUsers"
                            checked={onlyLockedUsers}
                            onChange={(e) =>
                              setOnlyLockedUsers(e.target.checked)
                            }
                            className="form-check-input"
                          />
                          <span className="form-check-label">
                            {L("OnlyLockedUsers")}
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {advancedFiltersAreShown && (
                    <div className="row mb-4">
                      <div className="col-sm-12 text-end">
                        <button
                          className="btn btn-primary float-end"
                          onClick={fetchData}
                          type="button"
                        >
                          <i className="fa fa-sync btn-md-icon"></i>
                          <span className="d-none d-md-inline-block ms-2">
                            {L("Refresh")}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="row mb-4">
                    <div className="col-sm-12">
                      <span
                        className="clickable-item text-muted"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          setAdvancedFiltersAreShown(!advancedFiltersAreShown)
                        }
                      >
                        <i
                          className={`fa ${
                            advancedFiltersAreShown
                              ? "fa-angle-up"
                              : "fa-angle-down"
                          }`}
                        ></i>{" "}
                        {advancedFiltersAreShown
                          ? L("HideAdvancedFilters")
                          : L("ShowAdvancedFilters")}
                      </span>
                    </div>
                  </div>
                </div>
              </form>

              <div className="row align-items-center">
                <Table<UserListDto>
                  rowKey="id"
                  dataSource={records}
                  columns={columns}
                  loading={loading}
                  pagination={pagination}
                  onChange={(pag, _filters, sorter) =>
                    handleTableChange(pag as TablePaginationConfig, sorter)
                  }
                  scroll={{ x: 1500 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateOrEditUserModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onSaved={fetchData}
        userId={editingUserId}
      />

      <EditUserPermissionsModal
        visible={permModal.visible}
        onClose={() => setPermModal({ visible: false })}
        userId={permModal.userId}
        userName={permModal.userName}
      />

      <ManageValuesModal
        isVisible={dynamicPropsModal.visible}
        onClose={closeDynamicPropsModal}
        entityFullName={dynamicPropsModal.entityFullName}
        entityId={dynamicPropsModal.entityId}
      />

      <ExcelColumnSelectionModal
        open={excelColumnModalOpen}
        columns={excelColumns}
        onClose={() => setExcelColumnModalOpen(false)}
        onSelect={(selectedColumns) => exportToExcel(selectedColumns)}
      />
    </>
  );
};

export default UsersPage;
