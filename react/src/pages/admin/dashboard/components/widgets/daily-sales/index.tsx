import React, { useEffect, useMemo, useState } from "react";
import { Column, type ColumnConfig } from "@ant-design/plots";
import { TenantDashboardServiceProxy } from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";

const WidgetDailySales: React.FC = () => {
  const tenantDashboardService = useServiceProxy(
    TenantDashboardServiceProxy,
    [],
  );
  const [data, setData] = useState<number[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const r = await tenantDashboardService.getDailySales();
      if (mounted) setData(r.dailySales || []);
    })();
    return () => {
      mounted = false;
    };
  }, [tenantDashboardService]);

  const chartData = useMemo(
    () => data.map((value, index) => ({ name: `${index + 1}`, value })),
    [data],
  );

  const config = useMemo(
    () =>
      ({
        data: chartData,
        xField: "name",
        yField: "value",
        color: "#34bfa3",
        label: false,
        xAxis: {
          label: {
            autoHide: false,
            autoRotate: false,
          },
        },
        tooltip: {
          customContent: (
            title: string,
            items: Array<{ value?: number | string }>,
          ) => {
            if (!items || items.length === 0) return "";
            const value = items[0]?.value;
            return `<div style="padding: 8px;">
            <div><strong>Day ${title}</strong></div>
            <div>${String(value ?? "")}</div>
          </div>`;
          },
        },
        minColumnWidth: 20,
        maxColumnWidth: 40,
        height: 200,
        autoFit: true,
      }) satisfies Partial<ColumnConfig>,
    [chartData],
  );

  return (
    <div className="card card-custom h-100">
      <div className="card-header align-items-center border-0">
        <h3 className="card-title align-items-start flex-column">
          <span className="fw-bolder text-gray-900">Daily Sales</span>
        </h3>
      </div>
      <div className="card-body">
        <div style={{ height: 200 }}>
          <Column {...config} />
        </div>
      </div>
    </div>
  );
};

export default WidgetDailySales;
