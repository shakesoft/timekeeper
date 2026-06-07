import React, { useEffect, useMemo, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ExpiringTenant,
  GetExpiringTenantsOutput,
  HostDashboardServiceProxy,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

const WidgetSubscriptionExpiringTenants: React.FC = () => {
  const hostDashboardService = useServiceProxy(HostDashboardServiceProxy, []);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GetExpiringTenantsOutput | undefined>();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const result =
          await hostDashboardService.getSubscriptionExpiringTenantsData();
        if (mounted) setData(result);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [hostDashboardService]);

  const columns: ColumnsType<ExpiringTenant> = useMemo(
    () => [
      { title: L("TenantName"), dataIndex: "tenantName", key: "tenantName" },
      {
        title: L("RemainingDay"),
        dataIndex: "remainingDayCount",
        key: "remainingDayCount",
      },
    ],
    [],
  );

  const records = useMemo(
    () => data?.expiringTenants ?? [],
    [data?.expiringTenants],
  );

  const gotoAllExpiringTenants = () => {
    const url =
      (window.abp?.appPath || "/") +
      "app/admin/tenants?" +
      "subscriptionEndDateStart=" +
      encodeURIComponent(data?.subscriptionEndDateStart?.toString() || "") +
      "&subscriptionEndDateEnd=" +
      encodeURIComponent(data?.subscriptionEndDateEnd?.toString() || "");
    window.open(url, "_blank");
  };

  return (
    <div className="card card-custom h-100">
      <div className="card-header align-items-center border-0">
        <div className="card-title">
          <span className="card-icon">
            <i className="la la-clock text-danger"></i>
          </span>
          <h3 className="card-label text-danger m-0">
            {L("SubscriptionExpiringTenants")}
            {data && (
              <small className="text-muted ms-2">
                {L(
                  "ExpiringTenantsHelpText",
                  data.subscriptionEndAlertDayCount,
                  data.maxExpiringTenantsShownCount,
                )}
              </small>
            )}
          </h3>
        </div>
      </div>
      <div className="card-body">
        <div className="scroller chart">
          {!loading && (
            <div className="primeng-datatable-container expiring-tenants-table">
              <Table<ExpiringTenant>
                rowKey={(r) =>
                  String(r.tenantName ?? "") +
                  "-" +
                  String(r.remainingDayCount ?? "")
                }
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
              className="see-all-expiring-tenants"
              onClick={(e) => {
                e.preventDefault();
                gotoAllExpiringTenants();
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

export default WidgetSubscriptionExpiringTenants;
