import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppConsts from "../../../../../lib/app-consts";
import {
  StripePaymentServiceProxy,
  PaymentServiceProxy,
  StripeConfigurationDto,
  StripeCreatePaymentSessionInput,
  SubscriptionPaymentDto,
  SubscriptionPaymentProductDto,
} from "../../../../../api/generated/service-proxies";
import { useCurrencySign } from "../../../../../hooks/useCurrencySign";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

type StripeWindow = Window & {
  Stripe?: (publishableKey: string) => {
    redirectToCheckout: (options: { sessionId: string }) => Promise<void>;
  };
};

const loadScript = (src: string) => {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${src}"]`,
    ) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === "1") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => {
        existing.dataset.loaded = "1";
        resolve();
      });
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load script")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.loaded = "0";
    script.addEventListener("load", () => {
      script.dataset.loaded = "1";
      resolve();
    });
    script.addEventListener("error", () =>
      reject(new Error("Failed to load script")),
    );
    document.body.appendChild(script);
  });
};

const StripePrePaymentPage: React.FC = () => {
  const stripeService = useServiceProxy(StripePaymentServiceProxy, []);
  const paymentService = useServiceProxy(PaymentServiceProxy, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [payment, setPayment] = useState<SubscriptionPaymentDto | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState<boolean>(true);

  const currencySign = useCurrencySign();

  const paymentId = useMemo(() => {
    const pid = Number(searchParams.get("paymentId"));
    return Number.isFinite(pid) ? pid : undefined;
  }, [searchParams]);

  useEffect(() => {
    const tenantIdParam = searchParams.get("tenantId");
    if (tenantIdParam) {
      const tId = parseInt(tenantIdParam, 10);
      if (!Number.isNaN(tId)) {
        abp?.multiTenancy?.setTenantIdCookie?.(tId);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!paymentId) {
        setLoading(false);
        return;
      }

      try {
        const result = await paymentService.getPayment(paymentId);
        if (!isMounted) return;
        setPayment(result);

        await loadScript("https://js.stripe.com/v3");

        const cfg: StripeConfigurationDto =
          await stripeService.getConfiguration();

        const sessionId = await stripeService.createPaymentSession(
          new StripeCreatePaymentSessionInput({
            paymentId: paymentId,
            successUrl: `${AppConsts.appBaseUrl}/account/stripe-post-payment`,
            cancelUrl: `${AppConsts.appBaseUrl}/account/stripe-cancel-payment`,
          }),
        );

        if (!cfg.publishableKey) {
          setLoading(false);
          return;
        }

        const stripe = (window as StripeWindow).Stripe?.(cfg.publishableKey);
        const btn = document.getElementById("stripe-checkout");
        if (stripe && btn) {
          btn.addEventListener("click", () => {
            stripe.redirectToCheckout({ sessionId });
          });
        }

        setLoading(false);
      } catch {
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [navigate, paymentId, paymentService, stripeService]);

  const products: SubscriptionPaymentProductDto[] = useMemo(() => {
    return payment?.subscriptionPaymentProducts || [];
  }, [payment]);

  return (
    <div className="login-form">
      <div className="pb-13 pt-lg-0 pt-5">
        <h3 className="fw-bolder text-gray-900 fs-4 fs-1-lg">
          {L("Purchase")}
        </h3>
      </div>
      <div className="form-actions">
        {products.map((product) => (
          <div key={product.id} className="d-flex justify-content-between">
            <span>
              {product.count} x {product.description}
            </span>
            <span>
              {currencySign}
              {Number((product.count || 0) * (product.amount || 0)).toFixed(2)}
            </span>
          </div>
        ))}
        <hr className="border-green" />
        <div className="mb-5 row">
          <label className="col-sm-4 form-label">{L("Price")}</label>
          <div className="col-sm-8 text-end">
            <p className="form-control-static text-bold" id="totalPrice">
              {currencySign}
              {Number(payment?.totalAmount || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {payment?.isRecurring && payment?.isProrationPayment && (
          <div className="mb-5 row">
            <label className="col-sm-12 form-label">
              {L("RecurringSubscriptionUpgradeNote")}
            </label>
          </div>
        )}

        {payment?.isRecurring && !payment?.isProrationPayment && (
          <div className="mb-5 row">
            <div className="col-sm-12 text-end">
              <p className="form-control-static text-bold" id="totalPrice">
                {L("AutomaticBilling")}
              </p>
            </div>
          </div>
        )}

        <button
          id="stripe-checkout"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading && (
            <span className="spinner-border spinner-border-sm me-2"></span>
          )}
          {L("Purchase")}
        </button>
      </div>
    </div>
  );
};

export default StripePrePaymentPage;
