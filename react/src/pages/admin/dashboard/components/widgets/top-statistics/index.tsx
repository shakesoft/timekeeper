import React, { useEffect, useState } from "react";
import { TenantDashboardServiceProxy } from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";

const WidgetTopStatistics: React.FC = () => {
  const tenantDashboardService = useServiceProxy(
    TenantDashboardServiceProxy,
    [],
  );
  const [data, setData] = useState<{
    totalProfit?: number;
    newFeedbacks?: number;
    newOrders?: number;
    newUsers?: number;
  }>({
    totalProfit: 0,
    newFeedbacks: 0,
    newOrders: 0,
    newUsers: 0,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const result = await tenantDashboardService.getTopStats();
      if (mounted) setData(result);
    })();
    return () => {
      mounted = false;
    };
  }, [tenantDashboardService]);

  return (
    <div className="h-100">
      <div className="row row-no-padding row-col-separator-xl h-100">
        <div className="col-lg-3 col-6">
          <div className="card card-custom bgi-no-repeat card-stretch new-subscription-statistics h-100">
            <div className="card-body">
              <span className="text-left fw-bolder text-gray-900 fs-5 text-hover-state-dark d-block">
                Total Profit
              </span>
              <span className="text-muted fw-bold text-left float-start col-12 p-0 mb-4">
                All Customs Value
              </span>
              <div className="text-left text-primary fw-bolder fs-2 me-2">
                ${(data?.totalProfit ?? 0).toFixed(0)}
              </div>
              <div className="progress progress-xs bg-primary-o-60">
                <div
                  className="progress-bar bg-primary"
                  role="progressbar"
                  style={{ width: "76%" }}
                  aria-valuenow={76}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted me-2 fs-sm fw-bold">Change</span>
                <span className="text-muted fs-sm fw-bold">76%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-6">
          <div className="card card-custom bgi-no-repeat card-stretch new-subscription-statistics h-100">
            <div className="card-body">
              <span className="text-left fw-bolder text-gray-900 fs-5 text-hover-state-dark d-block">
                New Feedbacks
              </span>
              <span className="text-muted fw-bold text-left float-start col-12 p-0 mb-4">
                Customer Review
              </span>
              <div className="text-left text-info fw-bolder fs-2 me-2">
                ${(data?.newFeedbacks ?? 0).toFixed(0)}
              </div>
              <div className="progress progress-xs bg-info-o-60">
                <div
                  className="progress-bar bg-info"
                  role="progressbar"
                  style={{ width: "85%" }}
                  aria-valuenow={85}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted me-2 fs-sm fw-bold">Change</span>
                <span className="text-muted fs-sm fw-bold">85%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-6 mt-lg-0 mt-5">
          <div className="card card-custom bgi-no-repeat card-stretch new-subscription-statistics h-100">
            <div className="card-body">
              <span className="text-left fw-bolder text-gray-900 fs-5 text-hover-state-dark d-block">
                New Orders
              </span>
              <span className="text-muted fw-bold text-left float-start col-12 p-0 mb-4">
                Fresh Order Amount
              </span>
              <div className="text-left text-danger fw-bolder fs-2 me-2">
                {(data?.newOrders ?? 0).toFixed(0)}
              </div>
              <div className="progress progress-xs bg-danger-o-60">
                <div
                  className="progress-bar bg-danger"
                  role="progressbar"
                  style={{ width: "45%" }}
                  aria-valuenow={45}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted me-2 fs-sm fw-bold">Change</span>
                <span className="text-muted fs-sm fw-bold">45%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-6 mt-lg-0 mt-5">
          <div className="card card-custom bgi-no-repeat card-stretch new-subscription-statistics h-100">
            <div className="card-body">
              <span className="text-left fw-bolder text-gray-900 fs-5 text-hover-state-dark d-block">
                New Users
              </span>
              <span className="text-muted fw-bold text-left float-start col-12 p-0 mb-4">
                Joined New User
              </span>
              <div className="text-left text-success fw-bolder fs-2 me-2">
                {(data?.newUsers ?? 0).toFixed(0)}
              </div>
              <div className="progress progress-xs bg-success-o-60">
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: "57%" }}
                  aria-valuenow={57}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-muted me-2 fs-sm fw-bold">Change</span>
                <span className="text-muted fs-sm fw-bold">57%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetTopStatistics;
