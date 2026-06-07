import React, { useEffect, useMemo, useState } from "react";
import { Area } from "@ant-design/plots";
import {
  SalesSummaryDatePeriod,
  TenantDashboardServiceProxy,
  SalesSummaryData,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useCurrencySign } from "@/hooks/useCurrencySign";

const WidgetSalesSummary: React.FC = () => {
  const tenantDashboardService = useServiceProxy(
    TenantDashboardServiceProxy,
    [],
  );
  const [period, setPeriod] = useState<SalesSummaryDatePeriod>(
    SalesSummaryDatePeriod.Daily,
  );
  const [data, setData] = useState<SalesSummaryData[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [growth, setGrowth] = useState(0);
  const currencySign = useCurrencySign();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const result = await tenantDashboardService.getSalesSummary(period);
      if (mounted) {
        setData(result.salesSummary ?? []);
        setTotalSales(result.totalSales ?? 0);
        setRevenue(result.revenue ?? 0);
        setExpenses(result.expenses ?? 0);
        setGrowth(result.growth ?? 0);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [period, tenantDashboardService]);

  const chartData = useMemo(() => {
    const result: { period: string; value: number; type: string }[] = [];
    data.forEach((item) => {
      result.push({
        period: item.period ?? "",
        value: item.sales ?? 0,
        type: "Sales",
      });
      result.push({
        period: item.period ?? "",
        value: item.profit ?? 0,
        type: "Profit",
      });
    });
    return result;
  }, [data]);

  const config = useMemo(
    () => ({
      data: chartData,
      xField: "period",
      yField: "value",
      seriesField: "type",
      smooth: true,
      isStack: true,
      areaStyle: {
        fillOpacity: 0.6,
      },
      color: ["#5470c6", "#91cc75"],
      legend: {
        position: "top" as const,
      },
      tooltip: {
        showMarkers: true,
      },
      height: 260,
      autoFit: true,
    }),
    [chartData],
  );

  return (
    <div className="card card-custom h-100">
      <div className="card-header align-items-center border-0">
        <h3 className="card-title align-items-start flex-column">
          <span className="fw-bolder text-gray-900">Sales Summary</span>
        </h3>
        <div className="card-toolbar">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm ${
                period === SalesSummaryDatePeriod.Daily
                  ? "btn-secondary active"
                  : "btn-secondary"
              }`}
              onClick={() => setPeriod(SalesSummaryDatePeriod.Daily)}
            >
              {L("Daily")}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                period === SalesSummaryDatePeriod.Weekly
                  ? "btn-secondary active"
                  : "btn-secondary"
              }`}
              onClick={() => setPeriod(SalesSummaryDatePeriod.Weekly)}
            >
              {L("Weekly")}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                period === SalesSummaryDatePeriod.Monthly
                  ? "btn-secondary active"
                  : "btn-secondary"
              }`}
              onClick={() => setPeriod(SalesSummaryDatePeriod.Monthly)}
            >
              {L("Monthly")}
            </button>
          </div>
        </div>
      </div>
      <div className="card-body" style={{ position: "relative" }}>
        <div className="row text-center mb-5">
          <div className="col-3">
            <h6 className="text-muted mb-2">Total Sales</h6>
            <div>
              <span className="text-danger fw-bolder fs-2">
                {totalSales.toFixed(0)}
              </span>
              <span className="text-danger fw-bolder fs-4">{currencySign}</span>
            </div>
          </div>
          <div className="col-3">
            <h6 className="text-muted mb-2">Revenue</h6>
            <div>
              <span className="text-warning fw-bolder fs-2">
                {revenue.toFixed(0)}
              </span>
              <span className="text-warning fw-bolder fs-4">
                {currencySign}
              </span>
            </div>
          </div>
          <div className="col-3">
            <h6 className="text-muted mb-2">Expenses</h6>
            <div>
              <span className="text-success fw-bolder fs-2">
                {expenses.toFixed(0)}
              </span>
              <span className="text-success fw-bolder fs-4">
                {currencySign}
              </span>
            </div>
          </div>
          <div className="col-3">
            <h6 className="text-muted mb-2">Growth</h6>
            <div>
              <span className="text-info fw-bolder fs-2">
                {growth.toFixed(0)}
              </span>
              <span className="text-info fw-bolder fs-4">{currencySign}</span>
            </div>
          </div>
        </div>
        <div>
          <Area {...config} />
        </div>
      </div>
    </div>
  );
};

export default WidgetSalesSummary;
