import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { TenantRegistrationServiceProxy } from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

const BuySucceed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [redirecting, setRedirecting] = useState<boolean>(false);
  const tenantRegistrationService = useServiceProxy(
    TenantRegistrationServiceProxy,
    [],
  );

  useEffect(() => {
    const paymentIdParam = searchParams.get("paymentId");
    const paymentId = paymentIdParam ? Number(paymentIdParam) : undefined;

    tenantRegistrationService
      .buyNowSucceed(paymentId)
      .then(() => {
        setRedirecting(true);
        setTimeout(() => {
          navigate("/app/admin/subscription-management");
        }, 3000);
      })
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
          <p className="text-center">{L("YourPaymentHasBeenCompleted")}</p>
          {redirecting && (
            <p className="text-muted mt-3">
              {L("RedirectingToSubscriptionManagement")}...
            </p>
          )}
        </div>

        {!redirecting && (
          <Link
            className="btn btn-info mt-5"
            to="/app/admin/subscription-management"
          >
            {L("GoToSubscriptionManagement")}
          </Link>
        )}
      </div>
    </div>
  );
};

export default BuySucceed;
