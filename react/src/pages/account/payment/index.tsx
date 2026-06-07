import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  PaymentServiceProxy,
  type PaymentGatewayModel,
  type SubscriptionPaymentDto,
  UpdatePaymentDto,
  SubscriptionPaymentGatewayType,
  SubscriptionPaymentProductDto,
} from "../../../api/generated/service-proxies";
import { getPaymentGatewayTypeName } from "./payment-helper";
import { useCurrencySign } from "../../../hooks/useCurrencySign";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

const GatewaySelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentService = useServiceProxy(PaymentServiceProxy, []);

  const [payment, setPayment] = useState<SubscriptionPaymentDto | undefined>(
    undefined,
  );
  const [gateways, setGateways] = useState<PaymentGatewayModel[]>([]);
  const [supportsRecurring, setSupportsRecurring] = useState<boolean>(false);
  const [recurringEnabled, setRecurringEnabled] = useState<boolean>(false);

  const currencySign = useCurrencySign();

  const paymentId = useMemo(() => {
    const pid = Number(searchParams.get("paymentId"));
    return Number.isFinite(pid) ? pid : undefined;
  }, [searchParams]);

  useEffect(() => {
    const pid = paymentId;
    if (!pid) return;

    paymentService.getPayment(pid).then((result) => {
      setPayment(result);
      const tId = result.tenantId as number | undefined;
      if (tId) {
        abp?.multiTenancy?.setTenantIdCookie?.(tId);
      }
    });

    paymentService.getActiveGateways(undefined).then((result) => {
      setGateways(result);
      setSupportsRecurring(result.some((g) => g.supportsRecurringPayments));
    });
  }, [paymentId, paymentService]);

  const checkout = async (
    gatewayType: SubscriptionPaymentGatewayType | number | string,
  ) => {
    if (!paymentId) return;
    const input = new UpdatePaymentDto();
    input.paymentId = paymentId;
    input.isRecurring = recurringEnabled;
    input.gateway = String(gatewayType);
    await paymentService.updatePayment(input);

    const name = getPaymentGatewayTypeName(gatewayType).toLowerCase();
    const target =
      name === "paypal" ? "paypal-pre-payment" : "stripe-pre-payment";
    navigate(
      `/account/${target}?paymentId=${encodeURIComponent(String(paymentId))}`,
    );
  };

  const products = useMemo(
    () => payment?.subscriptionPaymentProducts ?? [],
    [payment],
  );

  return (
    <div className="login-form">
      <input type="hidden" name="PaymentId" value={payment?.id ?? ""} />
      <div className="pb-5 pt-lg-0 pt-5">
        <h3 className="fw-bolder text-gray-900 fs-4 fs-1-lg pb-10">
          {L("PaymentInfo")}
        </h3>
        {products.map((p: SubscriptionPaymentProductDto) => (
          <div key={p.id} className="d-flex justify-content-between">
            <span>
              {p.count} x {p.description}
            </span>
            <span>
              {currencySign}
              {Number((p.amount || 0) * (p.count || 0)).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <hr />

      <div className="d-flex justify-content-between">
        <span>{L("Total")}</span>
        <span>
          {currencySign}
          {Number(payment?.totalAmount || 0).toFixed(2)}
        </span>
      </div>

      {supportsRecurring && (
        <div className="mb-5 mt-5">
          <label className="form-check form-check-custom form-check-solid">
            <input
              type="checkbox"
              name="RecurringPaymentEnabled"
              checked={recurringEnabled}
              onChange={(e) => setRecurringEnabled(e.target.checked)}
              className="form-check-input"
            />
            <span className="form-check-label">
              {L("AutomaticallyBillMyAccount")}
            </span>
          </label>
        </div>
      )}

      {gateways.map((g) => (
        <div key={g.gatewayType} className="mb-2">
          {(g.supportsRecurringPayments || !recurringEnabled) && (
            <button
              onClick={() => checkout(g.gatewayType)}
              className="btn btn-success w-100"
            >
              {L("CheckoutWith" + getPaymentGatewayTypeName(g.gatewayType))}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default GatewaySelectionPage;
