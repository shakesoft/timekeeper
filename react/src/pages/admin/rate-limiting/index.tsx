import React, { useState, useEffect, useCallback } from "react";
import { App, Dropdown, Table } from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  EntityDto,
  GetRateLimitPoliciesInput,
  RateLimitAlgorithm,
  RateLimitPartitionType,
  RateLimitPolicyDto,
  RateLimitPolicyServiceProxy,
} from "@api/generated/service-proxies";
import PageHeader from "../components/common/PageHeader";
import CreateOrEditRateLimitPolicyModal from "./components/CreateOrEditRateLimitPolicyModal";
import { useDataTable } from "@/hooks/useDataTable";
import { usePermissions } from "@/hooks/usePermissions";
import { useServiceProxy } from "@/api/service-proxy-factory";
import { useTheme } from "@/hooks/useTheme";
import L from "@/lib/L";

const algorithmLabels: Record<RateLimitAlgorithm, string> = {
  [RateLimitAlgorithm.FixedWindow]: "FixedWindow",
  [RateLimitAlgorithm.SlidingWindow]: "SlidingWindow",
  [RateLimitAlgorithm.TokenBucket]: "TokenBucket",
  [RateLimitAlgorithm.Concurrency]: "Concurrency",
};

const partitionTypeLabels: Record<RateLimitPartitionType, string> = {
  [RateLimitPartitionType.ByClientIp]: "ByClientIp",
  [RateLimitPartitionType.ByUser]: "ByUser",
  [RateLimitPartitionType.ByApiKey]: "ByApiKey",
};

const RateLimitingPage: React.FC = () => {
  const { isGranted } = usePermissions();
  const { containerClass } = useTheme();
  const { modal } = App.useApp();
  const rateLimitPolicyService = useServiceProxy(
    RateLimitPolicyServiceProxy,
    [],
  );

  const [filterText, setFilterText] = useState("");
  const [isRateLimitingEnabled, setIsRateLimitingEnabled] = useState<
    boolean | undefined
  >();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState<number | undefined>();

  const fetchFunction = useCallback(
    (skipCount: number, maxResultCount: number, sorting: string) => {
      const input = new GetRateLimitPoliciesInput();
      input.filter = filterText;
      input.sorting = sorting || undefined;
      input.maxResultCount = maxResultCount;
      input.skipCount = skipCount;
      return rateLimitPolicyService.getPolicies(input);
    },
    [filterText, rateLimitPolicyService],
  );

  const { records, loading, pagination, handleTableChange, fetchData } =
    useDataTable<RateLimitPolicyDto>(fetchFunction);

  useEffect(() => {
    fetchData();
    rateLimitPolicyService.getIsEnabled().then(setIsRateLimitingEnabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRateLimitingEnabledChange = async (isEnabled: boolean) => {
    await rateLimitPolicyService.setIsEnabled(isEnabled);
    setIsRateLimitingEnabled(isEnabled);
    abp.notify.success(
      isEnabled ? L("RateLimitingIsEnabled") : L("RateLimitingIsDisabled"),
    );
  };

  const openCreateOrEditModal = (id?: number) => {
    setEditingPolicyId(id);
    setIsModalVisible(true);
  };

  const deletePolicy = (policy: RateLimitPolicyDto) => {
    modal.confirm({
      title: L("AreYouSure"),
      content: L("RateLimitPolicyDeleteWarningMessage", policy.name),
      onOk: async () => {
        await rateLimitPolicyService.delete(policy.id);
        fetchData();
        abp.notify.success(L("SuccessfullyDeleted"));
      },
    });
  };

  const togglePolicyEnabled = async (policy: RateLimitPolicyDto) => {
    await rateLimitPolicyService.togglePolicyEnabled(
      new EntityDto({ id: policy.id }),
    );
    fetchData();
    abp.notify.success(L("SavedSuccessfully"));
  };

  const getMenuItems = (record: RateLimitPolicyDto): MenuProps["items"] => {
    const items: MenuProps["items"] = [];
    if (isGranted("Pages.Administration.RateLimiting.Edit")) {
      items.push({
        key: "edit",
        label: L("Edit"),
        onClick: () => openCreateOrEditModal(record.id),
      });
    }
    if (isGranted("Pages.Administration.RateLimiting.Delete")) {
      items.push({
        key: "delete",
        label: L("Delete"),
        onClick: () => deletePolicy(record),
      });
    }
    return items;
  };

  const columns: ColumnsType<RateLimitPolicyDto> = [
    {
      title: L("Actions"),
      key: "actions",
      width: 130,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getMenuItems(record) }}
          trigger={["click"]}
          placement="bottomLeft"
        >
          <button
            type="button"
            className="btn btn-primary btn-sm dropdown-toggle d-flex align-items-center"
          >
            <i className="fa fa-cog"></i>
            <span className="d-none d-md-inline-block ms-2">
              {L("Actions")}
            </span>
            <span className="caret ms-1"></span>
          </button>
        </Dropdown>
      ),
    },
    { title: L("Name"), dataIndex: "name", sorter: true },
    {
      title: L("Algorithm"),
      dataIndex: "algorithm",
      render: (algorithm: RateLimitAlgorithm) => (
        <span className="badge badge-info">
          {L(algorithmLabels[algorithm])}
        </span>
      ),
    },
    {
      title: L("PartitionType"),
      dataIndex: "partitionType",
      render: (partitionType: RateLimitPartitionType) =>
        L(partitionTypeLabels[partitionType]),
    },
    { title: L("PermitLimit"), dataIndex: "permitLimit" },
    { title: L("WindowInSeconds"), dataIndex: "windowInSeconds" },
    {
      title: L("IsGlobal"),
      dataIndex: "isGlobal",
      render: (isGlobal: boolean) =>
        isGlobal ? (
          <span className="badge badge-success">{L("Yes")}</span>
        ) : (
          <span className="badge badge-secondary">{L("No")}</span>
        ),
    },
    {
      title: L("IsEnabled"),
      dataIndex: "isEnabled",
      render: (isEnabled: boolean, record) => (
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            checked={isEnabled}
            onChange={() => togglePolicyEnabled(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={L("RateLimiting")}
        description={L("RateLimitingHeaderInfo")}
        actions={
          isGranted("Pages.Administration.RateLimiting.Create") && (
            <button
              className="btn btn-primary"
              onClick={() => openCreateOrEditModal()}
            >
              <i className="fa fa-plus btn-md-icon"></i>
              <span className="d-none d-md-inline-block">
                {L("CreateNewPolicy")}
              </span>
            </button>
          )
        }
      />
      <div className={containerClass}>
        <div className="card">
          <div className="card-body">
            <div className="d-flex align-items-center mb-5">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="RateLimitingEnabledToggle"
                  checked={!!isRateLimitingEnabled}
                  disabled={isRateLimitingEnabled === undefined}
                  onChange={(e) =>
                    handleRateLimitingEnabledChange(e.target.checked)
                  }
                />
                <label
                  className="form-check-label fw-bold"
                  htmlFor="RateLimitingEnabledToggle"
                >
                  {isRateLimitingEnabled === undefined
                    ? ""
                    : isRateLimitingEnabled
                      ? L("RateLimitingIsEnabled")
                      : L("RateLimitingIsDisabled")}
                </label>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6 col-sm-12">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    id="PoliciesTableFilter"
                    placeholder={L("SearchWithThreeDot")}
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        fetchData();
                      }
                    }}
                  />
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={fetchData}
                  >
                    <i className="fa fa-search"></i>
                  </button>
                </div>
              </div>
            </div>

            <Table<RateLimitPolicyDto>
              rowKey="id"
              dataSource={records}
              columns={columns}
              loading={loading}
              pagination={pagination}
              onChange={(pag, _filters, sorter) =>
                handleTableChange(pag as TablePaginationConfig, sorter)
              }
              scroll={{ x: true }}
            />
          </div>
        </div>
      </div>
      <CreateOrEditRateLimitPolicyModal
        isVisible={isModalVisible}
        policyId={editingPolicyId}
        onClose={() => setIsModalVisible(false)}
        onSave={fetchData}
      />
    </>
  );
};

export default RateLimitingPage;
