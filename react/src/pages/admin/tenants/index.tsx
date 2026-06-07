import React, { useCallback, useEffect, useRef, useState } from "react";
import { Form, Select, Table, Dropdown, DatePicker, App } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CommonLookupServiceProxy,
  EntityDto,
  SubscribableEditionComboboxItemDto,
  TenantListDto,
  TenantServiceProxy,
  FindUsersInput,
  FindUsersOutputDto,
  EditionServiceProxy,
} from "@api/generated/service-proxies";
import { useDataTable } from "../../../hooks/useDataTable";
import PageHeader from "../components/common/PageHeader";
import CreateTenantModal from "./components/CreateTenantModal";
import EditTenantModal from "./components/EditTenantModal";
import TenantFeaturesModal from "./components/TenantFeaturesModal";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import CommonLookupModal from "../components/common/lookup";
import useImpersonation from "@/pages/admin/users/hooks/useImpersonation";
import { usePermissions } from "@/hooks/usePermissions";
import { useTheme } from "@/hooks/useTheme";
import type { Dayjs } from "dayjs";
import {
  formatDate,
  fromISODateString,
  getEndOfDay,
  getEndOfDayMinusDays,
  getEndOfDayPlusDays,
  getStartOfDay,
} from "../components/common/timing/lib/datetime-helper";
import AppConsts from "@/lib/app-consts";

const { RangePicker } = DatePicker;

const TenantsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tenantService = useServiceProxy(TenantServiceProxy, []);
  const lookupService = useServiceProxy(CommonLookupServiceProxy, []);
  const editionLookupService = useServiceProxy(EditionServiceProxy, []);
  const { impersonateTenant } = useImpersonation();
  const { isGranted } = usePermissions();
  const { containerClass } = useTheme();
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const [editions, setEditions] = useState<
    SubscribableEditionComboboxItemDto[]
  >([]);

  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(location.search);
    const editionIdParam = params.get("editionId");
    const parsedEditionId = editionIdParam ? Number(editionIdParam) : -1;

    const subscriptionEndDateStart = params.get("subscriptionEndDateStart");
    const subscriptionEndDateEnd = params.get("subscriptionEndDateEnd");
    const creationStartDate = params.get("creationDateStart");
    const creationEndDate = params.get("creationDateEnd");

    const defaultSubscriptionRange: [Dayjs, Dayjs] = [
      getStartOfDay(),
      getEndOfDayPlusDays(30),
    ];
    const defaultCreationRange: [Dayjs, Dayjs] = [
      getEndOfDayMinusDays(7),
      getEndOfDay(),
    ];

    const subscriptionActive = !!(
      subscriptionEndDateStart && subscriptionEndDateEnd
    );
    const creationActive = !!(creationStartDate && creationEndDate);

    return {
      filterText: "",
      subscriptionDateRangeActive: subscriptionActive,
      creationDateRangeActive: creationActive,
      subscriptionDateRange: subscriptionActive
        ? [
            fromISODateString(subscriptionEndDateStart as string),
            fromISODateString(subscriptionEndDateEnd as string),
          ]
        : defaultSubscriptionRange,
      creationDateRange: creationActive
        ? [
            fromISODateString(creationStartDate as string),
            fromISODateString(creationEndDate as string),
          ]
        : defaultCreationRange,
      selectedEditionId:
        parsedEditionId !== undefined && !isNaN(parsedEditionId)
          ? parsedEditionId
          : undefined,
    } as {
      filterText: string;
      subscriptionDateRangeActive: boolean;
      creationDateRangeActive: boolean;
      subscriptionDateRange: [Dayjs | null, Dayjs | null];
      creationDateRange: [Dayjs | null, Dayjs | null];
      selectedEditionId: number | undefined;
    };
  });

  const hasAppliedQueryParamsRef = useRef(false);

  const [isCreateVisible, setCreateVisible] = useState(false);
  const [editingTenantId, setEditingTenantId] = useState<number | undefined>(
    undefined,
  );
  const [featuresVisible, setFeaturesVisible] = useState<{
    id?: number;
    name?: string;
  }>({});

  const [impersonateOpen, setImpersonateOpen] = useState<boolean>(false);
  const [impersonateTenantId, setImpersonateTenantId] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    editionLookupService
      .getEditionComboboxItems(null, true, false)
      .then((res) => {
        const items = res ?? [];
        setEditions([...items]);
      });
  }, [editionLookupService]);

  const fetchFunction = useCallback(
    (skipCount: number, maxResultCount: number, sorting: string) => {
      const [subscriptionStart, subscriptionEnd] =
        filters.subscriptionDateRange;
      const [creationStart, creationEnd] = filters.creationDateRange;

      const subStart =
        filters.subscriptionDateRangeActive && subscriptionStart
          ? subscriptionStart
          : undefined;
      const subEnd =
        filters.subscriptionDateRangeActive && subscriptionEnd
          ? subscriptionEnd.endOf("day")
          : undefined;
      const creStart =
        filters.creationDateRangeActive && creationStart
          ? creationStart
          : undefined;
      const creEnd =
        filters.creationDateRangeActive && creationEnd
          ? creationEnd.endOf("day")
          : undefined;

      const editionIdSpecified = filters.selectedEditionId !== -1;

      return tenantService.getTenants(
        filters.filterText,
        subStart,
        subEnd,
        creStart,
        creEnd,
        filters.selectedEditionId,
        editionIdSpecified,
        sorting,
        skipCount,
        maxResultCount,
      );
    },
    [filters, tenantService],
  );

  const { records, loading, pagination, handleTableChange, fetchData } =
    useDataTable<TenantListDto>(fetchFunction);

  useEffect(() => {
    if (!hasAppliedQueryParamsRef.current) {
      hasAppliedQueryParamsRef.current = true;
      return;
    }

    const params = new URLSearchParams(location.search);
    const editionId = params.get("editionId");

    if (editionId !== null) {
      const parsedEditionId = Number(editionId);
      const newEditionId = isNaN(parsedEditionId) ? undefined : parsedEditionId;

      setFilters((prev) =>
        prev.selectedEditionId === newEditionId
          ? prev
          : { ...prev, selectedEditionId: newEditionId },
      );

      form.setFieldsValue({ selectedEditionId: newEditionId });
    }

    const subscriptionEndDateStart = params.get("subscriptionEndDateStart");
    const subscriptionEndDateEnd = params.get("subscriptionEndDateEnd");
    if (subscriptionEndDateStart && subscriptionEndDateEnd) {
      const startDateTime = fromISODateString(subscriptionEndDateStart);
      const endDateTime = fromISODateString(subscriptionEndDateEnd);

      setFilters((prev) => ({
        ...prev,
        subscriptionDateRange: [startDateTime, endDateTime],
        subscriptionDateRangeActive: true,
      }));
      form.setFieldsValue({
        subscriptionDateRange: [startDateTime, endDateTime],
      });
    }

    const creationStartDate = params.get("creationDateStart");
    const creationEndDate = params.get("creationDateEnd");
    if (creationStartDate && creationEndDate) {
      const startDateTime = fromISODateString(creationStartDate);
      const endDateTime = fromISODateString(creationEndDate);

      setFilters((prev) => ({
        ...prev,
        creationDateRange: [startDateTime, endDateTime],
        creationDateRangeActive: true,
      }));
      form.setFieldsValue({ creationDateRange: [startDateTime, endDateTime] });
    }
  }, [location.search, form]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const unlockUser = async (record: TenantListDto) => {
    const dto = new EntityDto();
    dto.id = record.id;
    await tenantService.unlockTenantAdmin(dto);
  };

  const deleteTenant = (record: TenantListDto) => {
    modal.confirm({
      title: L("AreYouSure"),
      content: L("TenantDeleteWarningMessage", record.tenancyName),
      onOk: async () => {
        await tenantService.deleteTenant(record.id);
        fetchData();
      },
    });
  };

  const columns: ColumnsType<TenantListDto> = [
    {
      title: L("Actions"),
      key: "actions",
      width: 160,
      render: (_, record) => (
        <div className="btn-group">
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                ...(isGranted("Pages.Tenants.Impersonation")
                  ? [
                      {
                        key: "impersonate",
                        label: L("LoginAsThisTenant"),
                        disabled: !record.isActive,
                        onClick: () => {
                          const hasTenantCookie =
                            abp?.multiTenancy?.getTenantIdCookie?.();
                          if (hasTenantCookie) {
                            modal.warning({
                              title: L("Warning"),
                              content: L("YouAreNotLoggedInAsAHostUser"),
                              onOk: () => window.location.reload(),
                            });
                            return;
                          }
                          setImpersonateTenantId(record.id);
                          setImpersonateOpen(true);
                        },
                      },
                    ]
                  : []),
                {
                  key: "edit",
                  label: L("Edit"),
                  onClick: () => setEditingTenantId(record.id),
                },
                {
                  key: "features",
                  label: L("Features"),
                  onClick: () =>
                    setFeaturesVisible({
                      id: record.id,
                      name: record.name || "",
                    }),
                },
                {
                  key: "delete",
                  danger: true,
                  label: L("Delete"),
                  onClick: () => deleteTenant(record),
                },
                ...(record.isTenantAdminLocked
                  ? [
                      {
                        key: "unlock",
                        label: L("Unlock"),
                        onClick: () => unlockUser(record),
                      },
                    ]
                  : []),
                {
                  key: "history",
                  label: L("History"),
                  onClick: () =>
                    navigate(
                      `/app/admin/entity-changes/CadentManagement.MultiTenancy.Tenant/${record.id}`,
                    ),
                },
              ],
            }}
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
        </div>
      ),
    },
    {
      title: L("TenancyCode"),
      dataIndex: "tenancyName",
      sorter: true,
      render: (text, r) => (
        <>
          {r.connectionString && (
            <i className="fa fa-database" title={L("HasOwnDatabase")} />
          )}{" "}
          {text}
        </>
      ),
    },
    { title: L("TenantName"), dataIndex: "name", sorter: true },
    {
      title: L("Edition"),
      dataIndex: "editionDisplayName",
      render: (v?: string) => v || "-",
    },
    {
      title: L("SubscriptionEndDateUtc"),
      dataIndex: "subscriptionEndDateUtc",
      sorter: true,
      render: (subscriptionEndDateUtc?: string) =>
        subscriptionEndDateUtc
          ? formatDate(subscriptionEndDateUtc, AppConsts.timing.longDateFormat)
          : "-",
    },
    {
      title: L("Active"),
      dataIndex: "isActive",
      sorter: true,
      render: (v: boolean) =>
        v ? (
          <span className="badge badge-success badge-inline">{L("Yes")}</span>
        ) : (
          <span className="badge badge-dark badge-inline">{L("No")}</span>
        ),
    },
    {
      title: L("CreationTime"),
      dataIndex: "creationTime",
      sorter: true,
      render: (creationTime?: string) =>
        creationTime
          ? formatDate(creationTime, AppConsts.timing.longDateFormat)
          : "-",
    },
  ];

  return (
    <div>
      <PageHeader
        title={L("Tenants")}
        description={L("TenantsHeaderInfo")}
        actions={
          <button
            type="button"
            className="btn btn-primary d-inline-flex align-items-center"
            onClick={() => setCreateVisible(true)}
          >
            <i className="fa fa-plus me-2 align-middle"></i>
            <span className="align-middle">{L("CreateNewTenant")}</span>
          </button>
        }
      />

      <div className={containerClass}>
        <div className="card card-custom gutter-b">
          <div className="card-body">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchData();
              }}
              autoComplete="new-password"
              className="form"
            >
              <div className="row mb-4">
                <div className="col-md-6">
                  <label
                    htmlFor="TenantNameOrTenancyCode"
                    className="form-label"
                  >
                    {L("TenantNameOrTenancyCode")}
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      id="TenantNameOrTenancyCode"
                      name="filterText"
                      className="form-control"
                      value={filters.filterText}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          filterText: e.target.value,
                        }))
                      }
                      placeholder={L("SearchWithThreeDot") ?? undefined}
                    />
                    <button className="btn btn-primary" type="submit">
                      <i
                        className="flaticon-search-1"
                        aria-label={L("Search") as string}
                      ></i>
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <label htmlFor="EditionDropdown" className="form-label">
                    {L("Edition")}
                  </label>
                  <Select
                    id="EditionDropdown"
                    allowClear
                    className="form-select"
                    value={filters.selectedEditionId}
                    onChange={(val) =>
                      setFilters((prev) => ({
                        ...prev,
                        selectedEditionId: val as number | undefined,
                      }))
                    }
                    options={(editions ?? []).map((e) => ({
                      label: e.displayText,
                      value: e.value === "" ? undefined : Number(e.value),
                    }))}
                  />
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-check form-check-solid form-label py-1 mb-1">
                    <input
                      id="Tenants_SubscriptionEndDateRangeActive"
                      type="checkbox"
                      className="form-check-input"
                      checked={filters.subscriptionDateRangeActive}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          subscriptionDateRangeActive: e.target.checked,
                        }))
                      }
                    />
                    <span className="form-check-label">
                      {L("SubscriptionEndDate")}
                    </span>
                  </label>
                  <RangePicker
                    value={[
                      filters.subscriptionDateRange[0]!,
                      filters.subscriptionDateRange[1]!,
                    ]}
                    className="form-control d-inline-flex"
                    disabled={!filters.subscriptionDateRangeActive}
                    onChange={(dates) =>
                      setFilters((prev) => {
                        if (!dates) {
                          return {
                            ...prev,
                            subscriptionDateRange: [null, null],
                            subscriptionDateRangeActive: false,
                          };
                        }

                        const [start, end] = dates as [
                          Dayjs | null,
                          Dayjs | null,
                        ];

                        return {
                          ...prev,
                          subscriptionDateRange: [start, end],
                          subscriptionDateRangeActive: true,
                        };
                      })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-check form-check-solid form-label py-1 mb-1">
                    <input
                      id="Tenants_CreationDateRangeActive"
                      type="checkbox"
                      className="form-check-input"
                      checked={filters.creationDateRangeActive}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          creationDateRangeActive: e.target.checked,
                        }))
                      }
                    />
                    <span className="form-check-label">
                      {L("CreationTime")}
                    </span>
                  </label>
                  <RangePicker
                    value={[
                      filters.creationDateRange[0]!,
                      filters.creationDateRange[1]!,
                    ]}
                    className="form-control d-inline-flex"
                    disabled={!filters.creationDateRangeActive}
                    onChange={(dates) =>
                      setFilters((prev) => {
                        if (!dates) {
                          return {
                            ...prev,
                            creationDateRange: [null, null],
                          };
                        }

                        const [start, end] = dates as [
                          Dayjs | null,
                          Dayjs | null,
                        ];

                        return {
                          ...prev,
                          creationDateRange: [start, end],
                          creationDateRangeActive: true,
                        };
                      })
                    }
                  />
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-12 text-end">
                  <button
                    name="RefreshButton"
                    className="btn btn-primary"
                    type="submit"
                  >
                    <i className="fa fa-sync btn-md-icon"></i>
                    <span className="d-none d-md-inline-block">
                      {L("Refresh")}
                    </span>
                  </button>
                </div>
              </div>
            </form>

            <Table<TenantListDto>
              rowKey="id"
              dataSource={records}
              columns={columns}
              loading={loading}
              pagination={pagination}
              onChange={(pag, _filters, sorter) =>
                handleTableChange(pag as TablePaginationConfig, sorter)
              }
            />
          </div>
        </div>
      </div>

      <CreateTenantModal
        isVisible={isCreateVisible}
        onClose={() => setCreateVisible(false)}
        onSaved={fetchData}
      />

      <EditTenantModal
        isVisible={!!editingTenantId}
        tenantId={editingTenantId}
        onClose={() => setEditingTenantId(undefined)}
        onSaved={fetchData}
      />

      <TenantFeaturesModal
        isVisible={!!featuresVisible.id}
        tenantId={featuresVisible.id}
        tenantName={featuresVisible.name}
        onClose={() => setFeaturesVisible({})}
      />

      <CommonLookupModal<FindUsersOutputDto>
        isOpen={impersonateOpen}
        onClose={() => setImpersonateOpen(false)}
        tenantId={impersonateTenantId}
        options={{
          title: L("SelectAUser"),
          dataSource: async (skipCount, maxResultCount, filter, tenantId) => {
            const input = new FindUsersInput();
            input.filter = filter;
            input.maxResultCount = maxResultCount as number;
            input.skipCount = skipCount as number;
            input.tenantId = tenantId;
            input.excludeCurrentUser = true;
            const result = await lookupService.findUsers(input);
            return {
              totalCount: result.totalCount || 0,
              items: (result.items || []) as FindUsersOutputDto[],
            };
          },
        }}
        columns={[
          {
            key: "name",
            title: L("Name"),
            className: "min-w-200px",
            dataIndex: "name" as keyof FindUsersOutputDto,
          },
          {
            key: "surname",
            title: L("Surname"),
            className: "min-w-200px",
            dataIndex: "surname" as keyof FindUsersOutputDto,
          },
          {
            key: "email",
            title: L("Email"),
            className: "min-w-200px",
            dataIndex: "emailAddress" as keyof FindUsersOutputDto,
          },
        ]}
        onItemSelected={(item) => {
          if (!impersonateTenantId) return;
          void impersonateTenant(item.id, impersonateTenantId);
        }}
      />
    </div>
  );
};

export default TenantsPage;
