import React, { useCallback, useEffect, useState } from "react";
import { Pie, type PieConfig } from "@ant-design/plots";
import { TenantDashboardServiceProxy } from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";

const WidgetGeneralStatistics: React.FC = () => {
  const tenantDashboardService = useServiceProxy(
    TenantDashboardServiceProxy,
    [],
  );
  const [data, setData] = useState<{
    transactionPercent: number;
    newVisitPercent: number;
    bouncePercent: number;
  }>({
    transactionPercent: 0,
    newVisitPercent: 0,
    bouncePercent: 0,
  });

  const loadData = useCallback(async () => {
    const generalStats = await tenantDashboardService.getGeneralStats();
    setData({
      transactionPercent: generalStats.transactionPercent ?? 0,
      newVisitPercent: generalStats.newVisitPercent ?? 0,
      bouncePercent: generalStats.bouncePercent ?? 0,
    });
  }, [tenantDashboardService]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (mounted) {
        await loadData();
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loadData]);

  const config = (value: number, color: string) =>
    ({
      appendPadding: 10,
      data: [
        { type: "value", value: value },
        { type: "rest", value: 100 - value },
      ],
      angleField: "value",
      colorField: "type",
      color: (datum: Record<string, unknown>) => {
        const type = String((datum as { type?: unknown }).type ?? "");
        return type === "value" ? color : "#f0f0f0";
      },
      radius: 1,
      innerRadius: 0.64,
      label: false,
      legend: false,
      tooltip: false,
      statistic: {
        title: {
          style: {
            fontSize: "14px",
            fontWeight: "normal",
          },
          content: "Value",
        },
        content: {
          style: {
            fontSize: "20px",
            fontWeight: "bold",
          },
          content: `${value}%`,
        },
      },
      interactions: [],
    }) satisfies Partial<PieConfig>;

  const handleRefresh = () => {
    loadData();
  };

  return (
    <div className="card card-custom h-100">
      <div className="card-header align-items-center border-0">
        <h3 className="card-title align-items-start flex-column">
          <span className="fw-bolder text-gray-900">General Stats</span>
        </h3>
        <div className="card-toolbar">
          <button className="btn btn-primary btn-sm" onClick={handleRefresh}>
            <i className="fa fa-redo"></i>
            Refresh
          </button>
        </div>
      </div>
      <div
        className="card-body d-flex justify-content-center align-items-center"
        style={{ overflowX: "auto" }}
      >
        <div className="row w-100" style={{ maxWidth: 600 }}>
          <div className="col-4 text-center mb-3 mb-md-0">
            <div style={{ height: 180 }}>
              <Pie {...config(data.transactionPercent, "#5470c6")} />
            </div>
            <div className="mt-2 fw-bold">Operations</div>
          </div>
          <div className="col-4 text-center mb-3 mb-md-0">
            <div style={{ height: 180 }}>
              <Pie {...config(data.newVisitPercent, "#91cc75")} />
            </div>
            <div className="mt-2 fw-bold">New Visits</div>
          </div>
          <div className="col-4 text-center mb-3 mb-md-0">
            <div style={{ height: 180 }}>
              <Pie {...config(data.bouncePercent, "#fac858")} />
            </div>
            <div className="mt-2 fw-bold">Bounce</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetGeneralStatistics;
