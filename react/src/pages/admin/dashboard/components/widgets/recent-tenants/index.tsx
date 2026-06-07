import React, { useEffect, useMemo, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  GetRecentTenantsOutput,
  HostDashboardServiceProxy,
  RecentTenant,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import {
  formatDate,
  getDate,
} from "@/pages/admin/components/common/timing/lib/datetime-helper";
import { Dayjs } from "dayjs";
import AppConsts from "@/lib/app-consts";

const WidgetRecentTenants: React.FC = () => {
  const hostDashboardService = useServiceProxy(HostDashboardServiceProxy, []);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GetRecentTenantsOutput | undefined>();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const result = await hostDashboardService.getRecentTenantsData();
        if (mounted) setData(result);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [hostDashboardService]);

  const columns: ColumnsType<RecentTenant> = useMemo(
    () => [
      { title: L("TenantName"), dataIndex: "name", key: "name" },
      {
        title: L("CreationTime"),
        dataIndex: "creationTime",
        key: "creationTime",
        render: (creationTime: Dayjs) =>
          creationTime
            ? formatDate(creationTime, AppConsts.timing.shortDateFormat)
            : "",
      },
    ],
    [],
  );

  const records = useMemo(
    () => data?.recentTenants ?? [],
    [data?.recentTenants],
  );

  const gotoAllRecentTenants = () => {
    const url =
      (window.abp?.appPath || "/") +
      "app/admin/tenants?" +
      "creationDateStart=" +
      encodeURIComponent(data?.tenantCreationStartDate?.toString() || "") +
      "&creationDateEnd=" +
      encodeURIComponent(getDate().toString() ?? "");
    window.open(url, "_blank");
  };

  return (
    <div className="card card-custom h-100">
      <div className="card-header align-items-center border-0">
        <div className="card-title">
          <span className="card-icon">
            <i className="la la-user-plus text-primary"></i>
          </span>
          <h3 className="card-label text-primary m-0">
            {L("RecentTenants")}
            {!loading && data && (
              <small className="text-muted ms-2">
                {L(
                  "RecentTenantsHelpText",
                  data.recentTenantsDayCount,
                  data.maxRecentTenantsShownCount,
                )}
              </small>
            )}
          </h3>
        </div>
      </div>
      <div className="card-body">
        <div className="scroller chart">
          {!loading && (
            <div className="primeng-datatable-container recent-tenants-table">
              <Table<RecentTenant>
                rowKey={(r) => String(r.id)}
                loading={loading}
                dataSource={records}
                columns={columns}
                pagination={false}
                scroll={{ y: 150 }}
              />
            </div>
          )}
        </div>
        <div className="scroller-footer">
          <div className="btn-arrow-link pull-right">
            <a
              href="#"
              role="button"
              className="see-all-recent-tenants"
              onClick={(e) => {
                e.preventDefault();
                gotoAllRecentTenants();
              }}
            >
              {L("SeeAllRecords")}
            </a>
            <i className="icon-arrow-right"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetRecentTenants;
