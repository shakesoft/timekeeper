import React, { useEffect, useMemo, useState } from "react";
import { Pie, type PieConfig } from "@ant-design/plots";
import { TenantDashboardServiceProxy } from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";

const colors = ["#00c5dc", "#ffb822", "#716aca"];

const WidgetProfitShare: React.FC = () => {
  const tenantDashboardService = useServiceProxy(
    TenantDashboardServiceProxy,
    [],
  );
  const [data, setData] = useState<number[]>([]);

  const getChartItemName = (index: number) => {
    if (index === 0) return "Product Sales";
    if (index === 1) return "Online Courses";
    if (index === 2) return "Custom Development";
    return "Other";
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const r = await tenantDashboardService.getProfitShare();
      if (mounted) setData(r.profitShares || []);
    })();
    return () => {
      mounted = false;
    };
  }, [tenantDashboardService]);

  const chartData = useMemo(
    () =>
      data.map((value, index) => ({
        name: getChartItemName(index),
        value: value,
        color: colors[index % colors.length],
      })),
    [data],
  );

  const config = useMemo(
    () =>
      ({
        appendPadding: 10,
        data: chartData,
        angleField: "value",
        colorField: "name",
        color: (datum: Record<string, unknown>) => {
          const item = chartData.find((d) => d.name === datum.name);
          return item?.color || "#00c5dc";
        },
        radius: 1,
        innerRadius: 0.6,
        label: false,
        legend: false,
        tooltip: false,
        interactions: [],
        statistic: { title: false, content: false },
        height: 280,
        autoFit: true,
      }) satisfies Partial<PieConfig>,
    [chartData],
  );

  return (
    <div className="card card-custom h-100">
      <div className="card-header align-items-center border-0">
        <div className="card-title">
          <h3 className="card-label text-gray-900 d-flex align-items-center">
            Profit Share
            <small className="text-muted ms-2">
              Profit Share between customers
            </small>
          </h3>
        </div>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-6">
            <Pie {...config} />
          </div>
          {chartData.length > 0 && (
            <div className="col-6 d-flex justify-content-center align-items-center">
              <div>
                {chartData.map((item, index) => (
                  <div key={index} className="mb-2">
                    <span
                      className="d-inline-block"
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: item.color,
                        borderRadius: 2,
                        marginRight: 8,
                      }}
                    />
                    <span>
                      %{item.value} {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WidgetProfitShare;
