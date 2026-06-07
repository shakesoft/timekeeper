import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  HostDashboardServiceProxy,
  TopStatsData,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import { DashboardContext } from "../../../customizable-dashboard/types";
import useCurrencySign from "@/hooks/useCurrencySign";
import L from "@/lib/L";
import { Dayjs } from "dayjs";
import {
  formatDate,
  getDate,
  minusDays,
} from "@/pages/admin/components/common/timing/lib/datetime-helper";
import AppConsts from "@/lib/app-consts";

function useAnimatedNumber(targetValue: number, durationMs: number): number {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef<number>(0);
  const toRef = useRef<number>(targetValue);
  const displayValueRef = useRef<number>(0);

  useEffect(() => {
    displayValueRef.current = displayValue;
  }, [displayValue]);

  useEffect(() => {
    fromRef.current = displayValueRef.current;
    toRef.current = targetValue;
    startRef.current = null;
    let rafId = 0;

    const step = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      const next =
        fromRef.current + (toRef.current - fromRef.current) * progress;
      setDisplayValue(next);
      if (progress < 1) rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [targetValue, durationMs]);

  return displayValue;
}

const WidgetHostTopStatistics: React.FC = () => {
  const hostDashboardService = useServiceProxy(HostDashboardServiceProxy, []);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TopStatsData>();
  const ctx = useContext(DashboardContext);
  const currencySign = useCurrencySign();

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
        const topStatsData = await hostDashboardService.getTopStatsData(
          start,
          end,
        );
        if (mounted) setData(topStatsData);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [hostDashboardService, start, end]);

  const newSubscriptionAmountAnimated = useAnimatedNumber(
    Math.max(0, Math.round(data?.newSubscriptionAmount ?? 0)),
    800,
  );
  const newTenantsCountAnimated = useAnimatedNumber(
    Math.max(0, Math.round(data?.newTenantsCount ?? 0)),
    800,
  );
  const placeholder1Animated = useAnimatedNumber(
    Math.max(0, Math.round(data?.dashboardPlaceholder1 ?? 0)),
    800,
  );
  const placeholder2Animated = useAnimatedNumber(
    Math.max(0, Math.round(data?.dashboardPlaceholder2 ?? 0)),
    800,
  );

  return (
    <div className="h-100">
      <div className="row row-no-padding row-col-separator-xl h-100">
        <div className="col">
          <div className="card card-custom bgi-no-repeat card-stretch new-subscription-statistics h-100">
            <div className="card-body">
              <div className="card-title text-left fw-bolder text-gray-900 fs-5 mb-4 text-hover-state-dark d-block">
                {L("NewSubscriptionAmount")}
              </div>
              <div className="text-left text-primary fw-bolder fs-2 me-2">
                {loading && <span>...</span>}
                {!loading && (
                  <span>
                    {currencySign}
                    {newSubscriptionAmountAnimated.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                )}
              </div>
              <div className="progress progress-xs mt-7 bg-primary-o-60">
                <div
                  className="progress-bar bg-primary"
                  role="progressbar"
                  style={{ width: "100%" }}
                  aria-valuenow={100}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
              <div className="text-left text-muted mt-1 status-title">
                {formatDate(start, AppConsts.timing.shortDateFormat)} -{" "}
                {formatDate(end, AppConsts.timing.shortDateFormat)}
              </div>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card card-custom bgi-no-repeat card-stretch new-subscription-statistics h-100">
            <div className="card-body">
              <div className="card-title text-left fw-bolder text-gray-900 fs-5 mb-4 text-hover-state-dark d-block">
                {L("NewTenants")}
              </div>
              <div className="text-left text-info fw-bolder fs-2 me-2">
                {loading && <span>...</span>}
                {!loading && (
                  <span>
                    {newTenantsCountAnimated.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                )}
              </div>
              <div className="progress progress-xs mt-7 bg-danger-o-60">
                <div
                  className="progress-bar bg-info"
                  role="progressbar"
                  style={{ width: "100%" }}
                  aria-valuenow={100}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
              <div className="text-left text-muted mt-1 status-title">
                {formatDate(start, AppConsts.timing.shortDateFormat)} -{" "}
                {formatDate(end, AppConsts.timing.shortDateFormat)}
              </div>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card card-custom bgi-no-repeat card-stretch new-subscription-statistics h-100">
            <div className="card-body">
              <div className="card-title text-left fw-bolder text-gray-900 fs-5 mb-4 text-hover-state-dark d-block">
                {L("DashboardSampleStatistics")}
              </div>
              <div className="text-left text-danger fw-bolder fs-2 me-2">
                {!loading && (
                  <span>
                    {placeholder1Animated.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                )}
              </div>
              <div className="progress progress-xs mt-7 bg-danger-o-60">
                <div
                  className="progress-bar bg-danger"
                  role="progressbar"
                  style={{ width: "45%" }}
                  aria-valuenow={45}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted me-2 fs-sm fw-bold">
                  {L("DashboardSampleStatisticsHelpText")}
                </span>
                <span className="text-muted fs-sm fw-bold">45%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card card-custom bgi-no-repeat card-stretch new-subscription-statistics h-100">
            <div className="card-body">
              <div className="card-title text-left fw-bolder text-gray-900 fs-5 mb-4 text-hover-state-dark d-block">
                {L("DashboardSampleStatistics")} 2
              </div>
              <div className="text-left text-success fw-bolder fs-2 me-2">
                {loading && <span>...</span>}
                {!loading && (
                  <span>
                    {placeholder2Animated.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </span>
                )}
              </div>
              <div className="progress progress-xs mt-7 bg-success-o-60">
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: "65%" }}
                  aria-valuenow={65}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted me-2 fs-sm fw-bold">
                  {L("DashboardSampleStatisticsHelpText")}
                </span>
                <span className="text-muted fs-sm fw-bold">65%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetHostTopStatistics;
