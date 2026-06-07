import { SubscriptionPaymentGatewayType } from "../../../api/generated/service-proxies";

export const getPaymentGatewayTypeName = (
  gatewayType?: number | string,
): "Paypal" | "Stripe" => {
  const parsed =
    typeof gatewayType === "string" ? parseInt(gatewayType, 10) : gatewayType;
  return parsed === SubscriptionPaymentGatewayType.Paypal ? "Paypal" : "Stripe";
};
