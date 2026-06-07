import React, { useState, useEffect, useCallback } from "react";
import { Table, DatePicker } from "antd";
import { useDataTable } from "../../../../hooks/useDataTable";
import {
  AuditLogListDto,
  AuditLogServiceProxy,
  FileDto,
} from "../../../../api/generated/service-proxies";
import {
  formatDate,
  getStartOfDay,
  getEndOfDay,
  getStartOfDayForDate,
  getEndOfDayForDate,
} from "../../components/common/timing/lib/datetime-helper";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { downloadTempFile } from "@/lib/file-download-helper";
import { Dayjs } from "dayjs";
import AppConsts from "@/lib/app-consts";

const { RangePicker } = DatePicker;

interface Props {
  showAuditLogDetails: (record: AuditLogListDto) => void;
}

const OperationLogsTab: React.FC<Props> = ({ showAuditLogDetails }) => {
  const auditLogService = useServiceProxy(AuditLogServiceProxy, []);

  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(() => [getStartOfDay(), getEndOfDay()]);
  const [username, setUsername] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [methodName, setMethodName] = useState("");
  const [browserInfo, setBrowserInfo] = useState("");
  const [hasException, setHasException] = useState<string>("");
  const [minExecutionDuration, setMinExecutionDuration] = useState<
    number | undefined
  >();
  const [maxExecutionDuration, setMaxExecutionDuration] = useState<
    number | undefined
  >();
  const [advancedFiltersAreShown, setAdvancedFiltersAreShown] = useState(false);

  const fetchFunction = useCallback(
    (skipCount: number, maxResultCount: number, sorting: string | undefined) =>
      auditLogService
        .getAuditLogs(
          dateRange?.[0] ? getStartOfDayForDate(dateRange[0]) : getStartOfDay(),
          dateRange?.[1] ? getEndOfDayForDate(dateRange[1]) : getEndOfDay(),
          username,
          serviceName,
          methodName,
          browserInfo,
          hasException === "" ? undefined : hasException === "true",
          minExecutionDuration,
          maxExecutionDuration,
          sorting ?? "",
          skipCount,
          maxResultCount,
        )
        .then(
          (
            result: Awaited<ReturnType<typeof auditLogService.getAuditLogs>>,
          ) => ({
            items: result.items || [],
            totalCount: result.totalCount || 0,
          }),
        ),
    [
      dateRange,
      username,
      serviceName,
      methodName,
      browserInfo,
      hasException,
      minExecutionDuration,
      maxExecutionDuration,
      auditLogService,
    ],
  );

  const { records, loading, pagination, handleTableChange, fetchData } =
    useDataTable<AuditLogListDto>(fetchFunction);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dateRange,
    username,
    serviceName,
    methodName,
    browserInfo,
    hasException,
    minExecutionDuration,
    maxExecutionDuration,
  ]);

  const exportToExcel = async () => {
    const file: FileDto = await auditLogService.getAuditLogsToExcel(
      dateRange?.[0] ? getStartOfDayForDate(dateRange[0]) : getStartOfDay(),
      dateRange?.[1] ? getEndOfDayForDate(dateRange[1]) : getEndOfDay(),
      username,
      serviceName,
      methodName,
      browserInfo,
      hasException === "" ? undefined : hasException === "true",
      minExecutionDuration,
      maxExecutionDuration,
    );
    downloadTempFile(file);
  };

  const columns = [
    {
      title: "",
      width: 75,
      dataIndex: "actions",
      fixed: "left" as const,
      render: (_: unknown, record: AuditLogListDto) => (
        <div className="text-center">
          <button
            className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
            onClick={() => showAuditLogDetails(record)}
          >
            <i className="la la-search" aria-label={L("Search")}></i>
          </button>
        </div>
      ),
    },
    {
      title: "",
      width: 75,
      dataIndex: "exception",
      fixed: "left" as const,
      render: (_: unknown, record: AuditLogListDto) => (
        <div className="text-center">
          {record.exception ? (
            <i className="fa fa-exclamation-triangle text-warning"></i>
          ) : (
            <i className="fa fa-check-circle text-success"></i>
          )}
        </div>
      ),
    },
    {
      title: L("UserName"),
      dataIndex: "userName",
      sorter: true,
      width: 150,
      ellipsis: true,
    },
    {
      title: L("Service"),
      dataIndex: "serviceName",
      ellipsis: true,
      width: 250,
    },
    {
      title: L("Action"),
      dataIndex: "methodName",
      ellipsis: true,
      width: 250,
    },
    {
      title: L("Duration"),
      dataIndex: "executionDuration",
      render: (text: number) => `${text}ms`,
      sorter: true,
      width: 120,
    },
    {
      title: L("IpAddress"),
      dataIndex: "clientIpAddress",
      width: 150,
      ellipsis: true,
    },
    {
      title: L("Client"),
      dataIndex: "clientName",
      width: 150,
      ellipsis: true,
    },
    {
      title: L("Browser"),
      dataIndex: "browserInfo",
      ellipsis: true,
      width: 150,
      render: (text: string) => <span title={text}>{text}</span>,
    },
    {
      title: L("Time"),
      dataIndex: "executionTime",
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
            <label className="form-label" htmlFor="StartEndRange">
              {L("DateRange")}
            </label>
            <RangePicker
              className="form-control d-inline-flex"
              value={dateRange}
              onChange={(value) =>
                setDateRange(
                  value as
                    | [
                        import("dayjs").Dayjs | null,
                        import("dayjs").Dayjs | null,
                      ]
                    | null,
                )
              }
            />
          </div>
          <div className="col-md-6 mb-5">
            <label className="form-label" htmlFor="UsernameAuditLog">
              {L("UserName")}
            </label>
            <input
              id="UsernameAuditLog"
              type="text"
              name="UsernameAuditLog"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>
        {advancedFiltersAreShown && (
          <div className="row">
            <div className="col-md-6 mb-5">
              <label className="form-label" htmlFor="ServiceName">
                {L("Service")}
              </label>
              <input
                id="ServiceName"
                name="ServiceName"
                type="text"
                className="form-control"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label d-block">{L("Duration")}</label>
              <div className="input-group" style={{ width: "250px" }}>
                <input
                  type="number"
                  name="MinExecutionDuration"
                  className="form-control"
                  min={0}
                  max={86400000}
                  value={minExecutionDuration || ""}
                  onChange={(e) =>
                    setMinExecutionDuration(
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  placeholder="Min"
                />
                <span className="input-group-text">---</span>
                <input
                  type="number"
                  name="MaxExecutionDuration"
                  className="form-control"
                  min={0}
                  max={86400000}
                  value={maxExecutionDuration || ""}
                  onChange={(e) =>
                    setMaxExecutionDuration(
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  placeholder="Max"
                />
              </div>
            </div>
            <div className="col-md-6 mb-5">
              <label className="form-label" htmlFor="MethodName">
                {L("Action")}
              </label>
              <input
                id="MethodName"
                type="text"
                name="MethodName"
                className="form-control"
                value={methodName}
                onChange={(e) => setMethodName(e.target.value)}
              />
            </div>
            <div className="col-md-6 mb-5">
              <label className="form-label" htmlFor="HasException">
                {L("ErrorState")}
              </label>
              <select
                id="HasException"
                name="HasException"
                className="form-control"
                value={hasException}
                onChange={(e) => setHasException(e.target.value)}
              >
                <option value="">{L("All")}</option>
                <option value="false">{L("Success")}</option>
                <option value="true">{L("HasError")}</option>
              </select>
            </div>

            <div className="col-md-6 mb-5">
              <label className="form-label" htmlFor="BrowserInfo">
                {L("Browser")}
              </label>
              <input
                id="BrowserInfo"
                type="text"
                name="BrowserInfo"
                className="form-control"
                value={browserInfo}
                onChange={(e) => setBrowserInfo(e.target.value)}
              />
            </div>
            <div className="col-md-6 mb-5"></div>
          </div>
        )}
        <div className="row mb-2">
          <div className="col-sm-6">
            <span
              className="clickable-item text-muted"
              onClick={() =>
                setAdvancedFiltersAreShown(!advancedFiltersAreShown)
              }
              style={{ cursor: "pointer" }}
            >
              <i
                className={`fa fa-angle-${advancedFiltersAreShown ? "up" : "down"}`}
              ></i>{" "}
              {advancedFiltersAreShown
                ? L("HideAdvancedFilters")
                : L("ShowAdvancedFilters")}
            </span>
          </div>
        </div>
      </div>

      <div className="row align-items-center">
        <Table
          dataSource={records}
          columns={columns}
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          rowKey="id"
          scroll={{ x: 1500 }}
        />
      </div>
    </div>
  );
};
export default OperationLogsTab;
