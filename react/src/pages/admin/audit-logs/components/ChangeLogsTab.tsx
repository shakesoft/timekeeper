import React, { useState, useEffect, useCallback } from "react";
import { Table, Dropdown, DatePicker } from "antd";
import { useDataTable } from "../../../../hooks/useDataTable";
import {
  AuditLogServiceProxy,
  FileDto,
  type EntityChangeListDto,
  type NameValueDto,
} from "../../../../api/generated/service-proxies";
import {
  formatDate,
  getEndOfDay,
  getEndOfDayForDate,
  getStartOfDay,
  getStartOfDayForDate,
} from "../../components/common/timing/lib/datetime-helper";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { downloadTempFile } from "@/lib/file-download-helper";
import type { MenuProps } from "antd";
import { usePermissions } from "../../../../hooks/usePermissions";
import { useNavigate } from "react-router-dom";
import { Dayjs } from "dayjs";
import AppConsts from "@/lib/app-consts";

const { RangePicker } = DatePicker;

interface Props {
  showEntityChangeDetails: (record: EntityChangeListDto) => void;
}

const ChangeLogsTab: React.FC<Props> = ({ showEntityChangeDetails }) => {
  const auditLogService = useServiceProxy(AuditLogServiceProxy, []);
  const navigate = useNavigate();
  const { isGranted } = usePermissions();

  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(() => [getStartOfDay(), getEndOfDay()]);
  const [username, setUsername] = useState("");
  const [entityTypeFullName, setEntityTypeFullName] = useState<
    string | undefined
  >(undefined);
  const [objectTypes, setObjectTypes] = useState<NameValueDto[]>([]);

  useEffect(() => {
    auditLogService
      .getEntityHistoryObjectTypes()
      .then((result: NameValueDto[]) => {
        setObjectTypes(result);
      });
  }, [auditLogService]);

  const fetchFunction = useCallback(
    (skipCount: number, maxResultCount: number, sorting?: string) =>
      auditLogService
        .getEntityChanges(
          dateRange?.[0] ? getStartOfDayForDate(dateRange[0]) : getStartOfDay(),
          dateRange?.[1] ? getEndOfDayForDate(dateRange[1]) : getEndOfDay(),
          username,
          entityTypeFullName,
          sorting,
          skipCount,
          maxResultCount,
        )
        .then(
          (
            result: Awaited<
              ReturnType<typeof auditLogService.getEntityChanges>
            >,
          ) => ({
            items: result.items ?? [],
            totalCount: result.totalCount,
          }),
        ),
    [dateRange, username, entityTypeFullName, auditLogService],
  );

  const { records, loading, pagination, handleTableChange, fetchData } =
    useDataTable<EntityChangeListDto>(fetchFunction);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportToExcel = async () => {
    const file: FileDto = await auditLogService.getEntityChangesToExcel(
      dateRange?.[0] ? getStartOfDayForDate(dateRange[0]) : getStartOfDay(),
      dateRange?.[1] ? getEndOfDayForDate(dateRange[1]) : getEndOfDay(),
      username,
      entityTypeFullName,
    );
    downloadTempFile(file);
  };

  const columns = [
    {
      width: 120,
      dataIndex: "actions",
      fixed: "left" as const,
      render: (_: unknown, record: EntityChangeListDto) => {
        const items: MenuProps["items"] = [];
        if (isGranted("Pages.Administration.EntityChanges.FullHistory")) {
          items.push({
            key: "all",
            label: L("AllChanges"),
            onClick: () =>
              navigate(
                `/app/admin/entity-changes/${record.entityTypeFullName}/${record.entityId}`,
              ),
          });
        }
        items.push({
          key: "view",
          label: L("ViewChange"),
          onClick: () => showEntityChangeDetails(record),
        });
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
      title: L("Action"),
      dataIndex: "changeTypeName",
      sorter: true,
      render: (text: string) => L(`${text}`),
      width: 100,
      ellipsis: true,
    },
    {
      title: L("Object"),
      dataIndex: "entityTypeFullName",
      ellipsis: true,
      width: 250,
      render: (text: string) => <span title={text}>{text}</span>,
    },
    {
      title: L("UserName"),
      dataIndex: "userName",
      sorter: true,
      width: 100,
      ellipsis: true,
    },
    {
      title: L("ImpersonatorUserName"),
      dataIndex: "impersonatorUserName",
      width: 150,
      ellipsis: true,
    },
    {
      title: L("Time"),
      dataIndex: "changeTime",
      render: (text: string) =>
        formatDate(text, AppConsts.timing.longDateFormat),
      sorter: true,
      width: 150,
    },
  ];

  return (
    <div>
      <div className="row m-2 mt-5">
        <div className="col-sm-12 text-end">
          <button
            type="button"
            className="btn btn-primary float-end"
            onClick={() => fetchData()}
          >
            <i className="fa fa-sync btn-md-icon"></i>
            <span className="d-none d-md-inline-block"> {L("Refresh")}</span>
          </button>

          <button
            type="button"
            className="btn btn-success float-end me-1"
            onClick={() => void exportToExcel()}
          >
            <i className="far fa-file-excel btn-md-icon"></i>
            <span className="d-none d-md-inline-block">
              {" "}
              {L("ExportToExcel")}
            </span>
          </button>
        </div>
      </div>

      <div className="form">
        <div className="row align-items-center mb-2">
          <div className="col-md-6 mb-5">
            <label className="form-label" htmlFor="StartEndRangeEntityChange">
              {L("DateRange")}
            </label>
            <RangePicker
              id="StartEndRangeEntityChange"
              className="form-control d-inline-flex"
              value={dateRange}
              onChange={(value) =>
                setDateRange(
                  value
                    ? (value as [
                        import("dayjs").Dayjs | null,
                        import("dayjs").Dayjs | null,
                      ])
                    : null,
                )
              }
            />
          </div>
          <div className="col-md-6 mb-5">
            <label className="form-label" htmlFor="UserNameEntityChange">
              {L("UserName")}
            </label>
            <input
              id="UserNameEntityChange"
              type="text"
              name="UserNameEntityChange"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="col-md-6 mb-5">
            <label className="form-label" htmlFor="EntityTypeFullName">
              {L("Object")}
            </label>
            <select
              id="EntityTypeFullName"
              name="EntityTypeFullName"
              className="form-control"
              value={entityTypeFullName}
              onChange={(e) =>
                setEntityTypeFullName(e.target.value || undefined)
              }
            >
              <option value="undefined">{L("All")}</option>
              {objectTypes.map((objectType) => (
                <option key={objectType.value} value={objectType.value!}>
                  {objectType.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Table
        className="mt-4"
        dataSource={records}
        columns={columns}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        rowKey="id"
        scroll={{ x: 970 }}
      />
    </div>
  );
};
export default ChangeLogsTab;
