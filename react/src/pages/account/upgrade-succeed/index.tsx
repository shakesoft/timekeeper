import React, { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { TenantRegistrationServiceProxy } from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

const UpgradeSucceed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tenantRegistrationService = useServiceProxy(
    TenantRegistrationServiceProxy,
    [],
  );

  useEffect(() => {
    const paymentIdParam = searchParams.get("paymentId");
    const paymentId = paymentIdParam ? Number(paymentIdParam) : undefined;

    tenantRegistrationService
      .upgradeSucceed(paymentId)
      .then(() => navigate("/app/admin/subscription-management"))
      .catch(() => {});
  }, [navigate, searchParams, tenantRegistrationService]);

  return (
    <div
      className="d-flex h-100 align-items-center"
      style={{ paddingBottom: "150px" }}
    >
      <div className="login-form w-100 align-middle m-0 text-center">
        <div className="mb-5">
          &emsp;
          <i className="fas fa-check fa-5x text-success"></i>
        </div>

        <div className="d-flex align-items-center justify-content-center flex-column h-100 w-100">
          <h3 className="fw-bolder text-gray-900 fs-h4 fs-h1-lg">
            {L("ThankYou")}
          </h3>
          <p className="text-center">{L("YourSubscriptionHasBeenUpgraded")}</p>
        </div>

        <Link
          className="btn btn-info mt-5"
          to="/app/admin/subscription-management"
        >
          {L("GoToSubscriptionManagement")}
        </Link>
      </div>
    </div>
  );
};

export default UpgradeSucceed;
