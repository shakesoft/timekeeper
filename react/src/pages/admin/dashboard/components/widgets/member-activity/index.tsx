import React, { useCallback, useEffect, useState } from "react";
import { TenantDashboardServiceProxy } from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";

interface MemberActivity {
  name?: string;
  profilePictureName?: string;
  earnings?: string;
  cases?: number;
  closed?: number;
  rate?: string;
}

const WidgetMemberActivity: React.FC = () => {
  const tenantDashboardService = useServiceProxy(
    TenantDashboardServiceProxy,
    [],
  );
  const [memberActivities, setMemberActivities] = useState<MemberActivity[]>(
    [],
  );

  const loadData = useCallback(async () => {
    const result = await tenantDashboardService.getMemberActivity();
    setMemberActivities(result.memberActivities ?? []);
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

  const handleRefresh = () => {
    loadData();
  };

  return (
    <div className="card card-custom h-100">
      <div className="card-header align-items-center border-0">
        <h3 className="card-title align-items-start flex-column">
          <span className="fw-bolder text-gray-900">Member Activity</span>
        </h3>
        <div className="card-toolbar">
          <button onClick={handleRefresh} className="btn btn-primary">
            <i className="fa fa-sync"></i>
            Refresh
          </button>
        </div>
      </div>
      <div className="card-body" style={{ overflowY: "auto" }}>
        <div className="table-scrollable table-scrollable-borderless">
          <table className="table">
            <thead>
              <tr className="text-uppercase">
                <th colSpan={2}>MEMBER</th>
                <th>Earnings</th>
                <th>CASES</th>
                <th>CLOSED</th>
                <th>RATE</th>
              </tr>
            </thead>
            <tbody>
              {memberActivities.map((m, index) => (
                <tr key={index}>
                  <td className="ps-0 align-middle">
                    <div className="symbol symbol-50 symbol-light">
                      <div className="symbol-label">
                        <img
                          alt="photo"
                          src={`/metronic/assets/media/svg/avatars/${
                            m.profilePictureName || "001-boy.svg"
                          }`}
                          className="h-75 align-self-end"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="ps-0 align-middle symbol">
                    <span className="text-gray-900 fw-bolder mb-1 fs-lg symbol-label">
                      {m.name}
                    </span>
                  </td>
                  <td className="align-middle">{m.earnings}</td>
                  <td className="align-middle">{m.cases}</td>
                  <td className="align-middle">{m.closed}</td>
                  <td className="align-middle symbol">
                    <span className="symbol-label">{m.rate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WidgetMemberActivity;
