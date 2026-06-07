import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TenantRegistrationServiceProxy } from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";

const ExtendSucceed: React.FC = () => {
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
      .extendSucceed(paymentId)
      .then(() => navigate("/app/admin/subscription-management"))
      .catch(() => {});
  }, [navigate, searchParams, tenantRegistrationService]);

  return <div>Extend succeed !</div>;
};

export default ExtendSucceed;
