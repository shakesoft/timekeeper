import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Line, type LineConfig } from "@ant-design/plots";
import {
  ChartDateInterval,
  HostDashboardServiceProxy,
  IncomeStastistic,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import useCurrencySign from "@/hooks/useCurrencySign";
import { DashboardContext } from "../../../customizable-dashboard/types";
import {
  formatDate,
  getDate,
  minusDays,
} from "@/pages/admin/components/common/timing/lib/datetime-helper";
import AppConsts from "@/lib/app-consts";

const WidgetIncomeStatistics: React.FC = () => {
  const hostDashboardService = useServiceProxy(HostDashboardServiceProxy, []);
  const currencySign = useCurrencySign();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<ChartDateInterval>(
    ChartDateInterval.Daily,
  );
  const ctx = useContext(DashboardContext);
  const [data, setData] = useState<IncomeStastistic[]>([]);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [plotHeight, setPlotHeight] = useState<number>(260);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      const h = el.clientHeight;
      if (h && h !== plotHeight) setPlotHeight(Math.max(160, h - 90));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [bodyRef, plotHeight]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const result = await hostDashboardService.getIncomeStatistics(
          period,
          ctx?.selectedDateRange
            ? ctx.selectedDateRange[0]
            : minusDays(getDate(), 7),
          ctx?.selectedDateRange ? ctx.selectedDateRange[1] : getDate(),
        );
        if (mounted) setData(result.incomeStatistics ?? []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [period, ctx?.selectedDateRange, hostDashboardService]);

  const chartData = useMemo(
    () =>
      (data || []).map((d) => ({
        dateLabel: formatDate(d.date, AppConsts.timing.shortDateFormat),
        amount: Number(d.amount || 0),
      })),
    [data],
  );
  const hasData = useMemo(
    () => chartData.some((d) => (d.amount || 0) > 0),
    [chartData],
  );

  const config = useMemo(
    () =>
      ({
        data: chartData,
        xField: "dateLabel",
        yField: "amount",
        meta: {
          amount: {
            formatter: (v: number) =>
              `${currencySign}${Number(v || 0).toFixed(2)}`,
          },
        },
        smooth: true,
        point: { size: 2, shape: "circle" },
        xAxis: { title: { text: L("Date") } },
        yAxis: { title: { text: L("Income") } },
        tooltip: { showMarkers: true },
        height: plotHeight,
        autoFit: true,
      }) satisfies Partial<LineConfig>,
    [chartData, currencySign, plotHeight],
  );

  return (
    <div className="card card-custom h-100">
      <div className="card-header align-items-center border-0">
        <div className="card-title">
          <span className="card-icon">
            <i className="la la-chart-line text-primary"></i>
          </span>
          <h3 className="card-label text-primary m-0">
            {L("IncomeStatistics")}
            <small className="text-muted ms-2">
              {formatDate(
                ctx?.selectedDateRange
                  ? ctx.selectedDateRange[0]
                  : minusDays(getDate(), 7),
                AppConsts.timing.shortDateFormat,
              )}{" "}
              -{" "}
              {formatDate(
                ctx?.selectedDateRange ? ctx.selectedDateRange[1] : getDate(),
                AppConsts.timing.shortDateFormat,
              )}
            </small>
          </h3>
        </div>
        <div className="card-toolbar">
          <div
            className="btn-group"
            role="group"
            aria-label={L("ChartInterval") as string}
          >
            <button
              type="button"
              className={`btn btn-sm ${
                period === ChartDateInterval.Daily ? "btn-primary" : "btn-light"
              }`}
              onClick={() => setPeriod(ChartDateInterval.Daily)}
            >
              {L("Daily")}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                period === ChartDateInterval.Weekly
                  ? "btn-primary"
                  : "btn-light"
              }`}
              onClick={() => setPeriod(ChartDateInterval.Weekly)}
            >
              {L("Weekly")}
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                period === ChartDateInterval.Monthly
                  ? "btn-primary"
                  : "btn-light"
              }`}
              onClick={() => setPeriod(ChartDateInterval.Monthly)}
            >
              {L("Monthly")}
            </button>
          </div>
        </div>
      </div>
      <div className="card-body" ref={bodyRef} style={{ height: "100%" }}>
        {!loading && hasData && <Line {...config} />}
        {!loading && !hasData && (
          <div
            className="note note-info text-center chart"
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <small className="text-muted">{L("NoData")}</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default WidgetIncomeStatistics;
