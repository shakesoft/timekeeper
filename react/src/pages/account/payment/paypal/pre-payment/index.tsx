import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  PayPalPaymentServiceProxy,
  PaymentServiceProxy,
  type PayPalConfigurationDto,
  SubscriptionPaymentDto,
  SubscriptionPaymentProductDto,
} from "../../../../../api/generated/service-proxies";
import { useSession } from "../../../../../hooks/useSession";
import { useCurrencySign } from "../../../../../hooks/useCurrencySign";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

type PayPalWindow = Window & {
  paypal?: {
    Buttons: (options: {
      createOrder: (data: unknown, actions: PayPalActions) => Promise<unknown>;
      onApprove: (data: PayPalApproveData) => Promise<void>;
    }) => {
      render: (selector: string) => void;
    };
  };
};

type PayPalActions = {
  order: {
    create: (orderData: {
      purchase_units: Array<{
        amount: {
          value: string;
          currency_code: string;
        };
      }>;
    }) => Promise<unknown>;
  };
};

type PayPalApproveData = {
  orderID?: string;
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

const PayPalPrePaymentPage: React.FC = () => {
  const paypalService = useServiceProxy(PayPalPaymentServiceProxy, []);
  const paymentService = useServiceProxy(PaymentServiceProxy, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { application } = useSession();

  const [config, setConfig] = useState<PayPalConfigurationDto | undefined>(
    undefined,
  );
  const [payment, setPayment] = useState<SubscriptionPaymentDto | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const paypalContainerRef = useRef<HTMLDivElement>(null);

  const currencySign = useCurrencySign();
  const currencyCode = useMemo(
    () => application?.currency ?? "USD",
    [application?.currency],
  );

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

  const getDisabledFundingsQuery = useCallback((c?: PayPalConfigurationDto) => {
    const arr = c?.disabledFundings as string[] | undefined;
    if (!arr || !arr.length) return "";
    return `&disable-funding=${arr.join(",")}`;
  }, []);

  const preparePaypalButton = useCallback(() => {
    const w = window as PayPalWindow;
    if (!w.paypal || !paymentId || !payment) return;

    w.paypal
      .Buttons({
        createOrder: (_data: unknown, actions: PayPalActions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: Number(payment.totalAmount || 0).toFixed(2),
                  currency_code: currencyCode,
                },
              },
            ],
          });
        },
        onApprove: (data: PayPalApproveData) => {
          return paypalService
            .confirmPayment(paymentId, data?.orderID ?? undefined)
            .then(() => {
              const successUrl = payment?.successUrl || "";
              if (successUrl) {
                if (/^https?:\/\//i.test(successUrl)) {
                  window.location.href = `${successUrl}?paymentId=${encodeURIComponent(
                    String(paymentId),
                  )}`;
                } else {
                  navigate(
                    `${successUrl}?paymentId=${encodeURIComponent(
                      String(paymentId),
                    )}`,
                  );
                }
              }
            });
        },
      })
      .render("#paypal-button");
  }, [currencyCode, navigate, payment, paymentId, paypalService]);

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

        const cfg = await paypalService.getConfiguration();
        if (!isMounted) return;
        setConfig(cfg);

        const disabled = getDisabledFundingsQuery(cfg);
        const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
          cfg?.clientId || "",
        )}&currency=${encodeURIComponent(currencyCode)}${disabled}`;
        await loadScript(sdkUrl);
        if (!isMounted) return;

        setTimeout(() => preparePaypalButton(), 0);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [
    currencyCode,
    getDisabledFundingsQuery,
    paymentId,
    preparePaypalButton,
    paymentService,
    paypalService,
  ]);

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

        {config && config.demoUsername && config.demoPassword && (
          <div className="alert bg-light-primary d-flex align-items-center p-5 mb-10">
            <span className="svg-icon svg-icon-2hx svg-icon-primary me-4">
              <i className="fas fa-info-circle fs-1" />
            </span>
            <div className="d-flex flex-column">
              <h4 className="mb-1 text-primary">{L("DemoPayPalAccount")}</h4>
              <span>
                <p>
                  <span>
                    {L("UserName")}: <strong>{config.demoUsername}</strong>
                  </span>
                  <br />
                  <span>
                    {L("Password")}: <strong>{config.demoPassword}</strong>
                  </span>
                </p>
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-4">
            <span className="spinner-border spinner-border-sm me-2"></span>
            <span>{L("Loading")}</span>
          </div>
        ) : (
          <div id="paypal-button" ref={paypalContainerRef} />
        )}
      </div>
    </div>
  );
};

export default PayPalPrePaymentPage;
