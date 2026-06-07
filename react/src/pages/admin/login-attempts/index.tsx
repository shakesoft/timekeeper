import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DatePicker, Table, Tag } from "antd";
import { useDataTable } from "../../../hooks/useDataTable";
import { getLoginResultTypeOptions } from "./login-attempts.helpers";
import {
  AbpLoginResultType,
  UserLoginAttemptDto,
  UserLoginServiceProxy,
} from "@api/generated/service-proxies";
import {
  formatDate,
  getEndOfDay,
  getDate,
  getStartOfDayForDate,
  getEndOfDayForDate,
} from "../components/common/timing/lib/datetime-helper";
import PageHeader from "../components/common/PageHeader";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { Dayjs } from "dayjs";
import AppConsts from "@/lib/app-consts";
import { useTheme } from "@/hooks/useTheme";

const { RangePicker } = DatePicker;
const getStartOfWeek = (): Dayjs => getDate().startOf("week");

const LoginAttemptsPage: React.FC = () => {
  const userLoginService = useServiceProxy(UserLoginServiceProxy, []);
  const { containerClass } = useTheme();

  const [filters, setFilters] = useState({
    filterText: "",
    dateRange: [getStartOfWeek(), getEndOfDay()] as [
      Dayjs | null,
      Dayjs | null,
    ],
    loginResult: "" as AbpLoginResultType | "",
  });

  const loginResultTypeOptions = useMemo(() => getLoginResultTypeOptions(), []);

  const fetchFunction = useCallback(
    (skipCount: number, maxResultCount: number, sorting: string) =>
      userLoginService.getUserLoginAttempts(
        filters.filterText,
        filters.dateRange[0]
          ? getStartOfDayForDate(filters.dateRange[0])
          : null,
        filters.dateRange[1] ? getEndOfDayForDate(filters.dateRange[1]) : null,
        filters.loginResult === "" ? undefined : filters.loginResult,
        sorting,
        maxResultCount,
        skipCount,
      ),
    [filters, userLoginService],
  );

  const { records, loading, pagination, handleTableChange, fetchData } =
    useDataTable<UserLoginAttemptDto>(fetchFunction);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ?? "";
    setFilters((prev) => ({ ...prev, filterText: value }));
  };

  const handleFilterKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchData();
    }
  };

  const handleLoginResultChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({
      ...prev,
      loginResult: value === "" ? "" : (Number(value) as AbpLoginResultType),
    }));
  };

  const getResultTag = (result: string) => {
    if (result === "Success") {
      return <Tag color="success">{L("AbpLoginResultType_Success")}</Tag>;
    }
    return <Tag color="error">{L(`AbpLoginResultType_${result}`)}</Tag>;
  };

  const columns = [
    { title: L("IpAddress"), width: 100, dataIndex: "clientIpAddress" },
    { title: L("Client"), width: 100, dataIndex: "clientName" },
    {
      title: L("Browser"),
      width: 400,
      dataIndex: "browserInfo",
      ellipsis: true,
    },
    {
      title: L("Time"),
      width: 200,
      dataIndex: "creationTime",
      render: (text: string) =>
        formatDate(text, AppConsts.timing.longDateFormat),
      sorter: true,
    },
    {
      title: L("Result"),
      dataIndex: "result",
      render: (text: string) => getResultTag(text),
    },
  ];

  return (
    <div>
      <PageHeader
        title={L("LoginAttempts")}
        description={L("LoginAttemptsHeaderInfo")}
      />
      <div className={containerClass}>
        <div className="card card-custom gutter-b">
          <div className="card-body">
            <div className="form">
              <div className="row align-items-center mb-4">
                <div className="col-md-12">
                  <div className="mb-5">
                    <label htmlFor="LoginAttemptsFilter" className="form-label">
                      {L("Filter")}
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        id="LoginAttemptsFilter"
                        className="form-control"
                        placeholder={L("SearchWithThreeDot")}
                        value={filters.filterText}
                        onChange={handleFilterTextChange}
                        onKeyDown={handleFilterKeyDown}
                      />
                      <span className="input-group-append">
                        <button
                          id="GetLoginAttemptsButton"
                          className="btn btn-primary"
                          onClick={fetchData}
                        >
                          <i
                            className="flaticon-search-1"
                            aria-label={L("Search")}
                          ></i>
                        </button>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row align-items-center mb-4">
                <div className="col-md-6">
                  <div className="mb-5">
                    <label htmlFor="StartEndRange" className="form-label">
                      {L("DateRange")}
                    </label>
                    <div className="input-group">
                      <RangePicker
                        className="form-control d-inline-flex"
                        value={filters.dateRange}
                        onChange={(dates) =>
                          setFilters((prev) => {
                            if (!dates) {
                              return {
                                ...prev,
                                dateRange: [null, null],
                                dateRangeActive: false,
                              };
                            }

                            const [start, end] = dates as [
                              Dayjs | null,
                              Dayjs | null,
                            ];

                            return {
                              ...prev,
                              dateRange: [start, end],
                              dateRangeActive: true,
                            };
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-5">
                    <label htmlFor="LoginResultFilter" className="form-label">
                      {L("Result")}
                    </label>
                    <select
                      id="LoginResultFilter"
                      className="form-select"
                      value={filters.loginResult}
                      onChange={handleLoginResultChange}
                    >
                      {loginResultTypeOptions.map((opt) => (
                        <option
                          key={String(opt.value)}
                          value={String(opt.value)}
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-12 text-end">
                  <button
                    name="RefreshButton"
                    className="btn btn-primary"
                    onClick={fetchData}
                  >
                    <i className="la la-refresh btn-md-icon"></i>
                    <span className="d-none d-md-inline-block">
                      {L("Refresh")}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="row align-items-center mt-4">
              <div className="col-xl-12">
                <Table
                  dataSource={records}
                  columns={columns}
                  pagination={pagination}
                  loading={loading}
                  onChange={handleTableChange}
                  rowKey={(record) =>
                    `${record.clientIpAddress || "na"}-${
                      record.creationTime?.valueOf()
                        ? record.creationTime.valueOf()
                        : record.creationTime
                    }`
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAttemptsPage;
