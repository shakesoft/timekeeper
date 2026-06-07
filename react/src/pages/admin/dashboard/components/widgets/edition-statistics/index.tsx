import React, { useContext, useEffect, useMemo, useState } from "react";
import { HostDashboardServiceProxy } from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import { Pie, type PieConfig } from "@ant-design/plots";
import { DashboardContext } from "../../../customizable-dashboard/types";
import L from "@/lib/L";
import { Dayjs } from "dayjs";
import {
  formatDate,
  getDate,
  minusDays,
} from "@/pages/admin/components/common/timing/lib/datetime-helper";
import AppConsts from "@/lib/app-consts";

const WidgetEditionStatistics: React.FC = () => {
  const hostDashboardService = useServiceProxy(HostDashboardServiceProxy, []);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const ctx = useContext(DashboardContext);
  const [start, end] = useMemo<[Dayjs, Dayjs]>(() => {
    const defaultEnd = getDate();
    const defaultStart = minusDays(defaultEnd, 7);
    if (ctx?.selectedDateRange) {
      return ctx.selectedDateRange;
    }
    return [defaultStart, defaultEnd];
  }, [ctx?.selectedDateRange]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const result = await hostDashboardService.getEditionTenantStatistics(
          start,
          end,
        );
        const arr = (result.editionStatistics || []).map(
          (e: { label?: string; value?: number }) => ({
            name: String(e.label ?? ""),
            value: Number(e.value ?? 0),
          }),
        );
        if (mounted) setData(arr);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [hostDashboardService, start, end]);

  const hasData = useMemo(
    () => (data || []).some((d) => (d?.value ?? 0) > 0),
    [data],
  );

  const chartConfig = useMemo(
    () =>
      ({
        data,
        angleField: "value",
        colorField: "name",
        radius: 0.7,
        innerRadius: 0.75,
        height: 200,
        legend: {
          position: "right",
        },
        tooltip: {
          showTitle: false,
        },
        label: false,
        interactions: [{ type: "element-active" }],
        animation: {
          appear: { animation: "wave-in", duration: 600 },
        },
        autoFit: true,
      }) satisfies Partial<PieConfig>,
    [data],
  );

  return (
    <div className="card card-custom h-100">
      <div className="card-header align-items-center border-0">
        <div className="card-title">
          <span className="card-icon">
            <i className="la la-pie-chart text-success"></i>
          </span>
          <h3 className="card-label text-success m-0">
            {L("EditionStatistics")}
            <small className="text-muted ms-2">
              {formatDate(start, AppConsts.timing.shortDateFormat)} -{" "}
              {formatDate(end, AppConsts.timing.shortDateFormat)}
            </small>
          </h3>
        </div>
      </div>
      <div className="card-body">
        {!loading && hasData && <Pie {...chartConfig} />}
        {!loading && !hasData && (
          <div
            className="note note-info text-center chart"
            style={{
              height: 300,
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

export default WidgetEditionStatistics;
