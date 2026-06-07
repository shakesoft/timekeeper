import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StripePaymentServiceProxy } from "../../../../../api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

const StripePostPaymentPage: React.FC = () => {
  const stripePaymentService = useServiceProxy(StripePaymentServiceProxy, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paymentId = useMemo(() => {
    const pid = Number(searchParams.get("paymentId"));
    return Number.isFinite(pid) ? pid : undefined;
  }, [searchParams]);

  const [loading, setLoading] = useState<boolean>(true);
  const [tryDelayMs, setTryDelayMs] = useState<number>(5000);
  const [remainingTries, setRemainingTries] = useState<number>(5);

  useEffect(() => {
    let isMounted = true;
    const poll = async () => {
      if (!paymentId) {
        setLoading(false);
        return;
      }
      try {
        const result = await stripePaymentService.getPaymentResult(paymentId);
        if (!isMounted) return;
        if (result.paymentDone) {
          const url = result.callbackUrl || "";
          if (url) {
            if (/^https?:\/\//i.test(url)) {
              window.location.href = `${url}?paymentId=${encodeURIComponent(String(paymentId))}`;
            } else {
              navigate(
                `${url}?paymentId=${encodeURIComponent(String(paymentId))}`,
              );
            }
          }
        } else if (remainingTries > 0) {
          setTimeout(() => {
            setRemainingTries((n) => n - 1);
            setTryDelayMs((d) => d * 2);
          }, tryDelayMs);
        } else {
          setLoading(false);
        }
      } catch {
        if (remainingTries > 0) {
          setTimeout(() => {
            setRemainingTries((n) => n - 1);
            setTryDelayMs((d) => d * 2);
          }, tryDelayMs);
        } else {
          setLoading(false);
        }
      }
    };
    poll();
    return () => {
      isMounted = false;
    };
  }, [navigate, paymentId, remainingTries, tryDelayMs, stripePaymentService]);

  return (
    <div
      className="d-flex h-100 align-items-center"
      style={{ paddingBottom: "150px" }}
    >
      <div className="login-form align-items-center w-100 m-0">
        <div className="pb-13 pt-lg-0 pt-5">
          <h3 className="fw-bolder text-gray-900 text-center fs-h4 fs-h1-lg">
            {L("PleaseWait")}
          </h3>
          <p className="text-center">{L("ReceivingPaymentResult")}</p>
          {loading && (
            <div className="text-center mt-5">
              <span
                className="spinner-border text-primary"
                role="status"
                aria-hidden="true"
              ></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StripePostPaymentPage;
