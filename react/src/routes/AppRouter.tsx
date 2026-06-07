import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";

const AppLayout = React.lazy(
  () => import("../pages/admin/components/layout/AppLayout"),
);
const ProtectedRoute = React.lazy(() => import("./ProtectedRoute"));
const AuditLogs = React.lazy(() => import("../pages/admin/audit-logs"));
const EntityChanges = React.lazy(() => import("../pages/admin/entity-changes"));
const Users = React.lazy(() => import("../pages/admin/users"));
const Roles = React.lazy(() => import("../pages/admin/roles"));
const DemoUiComponents = React.lazy(
  () => import("../pages/admin/demo-ui-components"),
);
const Languages = React.lazy(() => import("../pages/admin/languages"));
const LanguageTexts = React.lazy(
  () => import("../pages/admin/languages/texts"),
);
const TenantSettings = React.lazy(
  () => import("../pages/admin/settings/tenant"),
);
const HostSettings = React.lazy(() => import("../pages/admin/settings/host"));
const SubscriptionManagement = React.lazy(
  () => import("../pages/admin/subscription-management"),
);
const TenantsPage = React.lazy(() => import("../pages/admin/tenants"));
const EditionsPage = React.lazy(() => import("../pages/admin/editions"));
const InvoicePage = React.lazy(
  () => import("../pages/admin/subscription-management/invoice"),
);
const UiCustomization = React.lazy(
  () => import("../pages/admin/ui-customization"),
);
const OrganizationUnits = React.lazy(
  () => import("../pages/admin/organization-units"),
);
const WebhookSubscriptions = React.lazy(
  () => import("../pages/admin/webhook-subscription"),
);
const WebhookSubscriptionDetail = React.lazy(
  () => import("../pages/admin/webhook-subscription/detail"),
);
const WebhookEventDetail = React.lazy(
  () => import("../pages/admin/webhook-subscription/detail/event"),
);
const DynamicEntityProperties = React.lazy(
  () => import("../pages/admin/dynamic-properties"),
);
const DynamicEntityPropertyValues = React.lazy(
  () =>
    import("../pages/admin/dynamic-properties/dynamic-entity-property-values"),
);
const LoginAttempts = React.lazy(() => import("../pages/admin/login-attempts"));
const ActiveSessions = React.lazy(
  () => import("../pages/admin/active-sessions"),
);
const Maintenance = React.lazy(() => import("../pages/admin/maintenance"));
const MassNotifications = React.lazy(
  () => import("../pages/admin/mass-notifications"),
);
const Notifications = React.lazy(() => import("../pages/admin/notifications"));

const AccountIndex = React.lazy(() => import("../pages/account/index"));
const AccountLogin = React.lazy(() => import("../pages/account/login/index"));
const AccountRegister = React.lazy(
  () => import("../pages/account/register/index"),
);
const RegisterSelectEdition = React.lazy(
  () => import("../pages/account/register/select-edition"),
);
const RegisterTenant = React.lazy(
  () => import("../pages/account/register/tenant"),
);
const RegisterTenantResult = React.lazy(
  () => import("../pages/account/register/tenant/result"),
);
const AccountForgotPassword = React.lazy(
  () => import("../pages/account/password/forgot-password"),
);
const AccountResetPassword = React.lazy(
  () => import("../pages/account/password/reset-password"),
);
const AccountEmailActivation = React.lazy(
  () => import("../pages/account/email-activation/email-activation"),
);
const AccountConfirmEmail = React.lazy(
  () => import("../pages/account/email-activation/confirm-email"),
);
const AccountChangeEmail = React.lazy(
  () => import("../pages/account/change-email"),
);
const AccountSendTwoFactor = React.lazy(
  () => import("../pages/account/login/send-two-factor-code"),
);
const AccountVerifyTwoFactor = React.lazy(
  () => import("../pages/account/login/send-two-factor-code/validate"),
);
const AccountPasswordlessLogin = React.lazy(() =>
  import("../pages/account/login/passwordless-login/index").then((m) => ({
    default: m.default,
  })),
);
const AccountVerifyPasswordless = React.lazy(
  () => import("../pages/account/login/passwordless-login/validate"),
);
const AccountGatewaySelection = React.lazy(
  () => import("../pages/account/payment/index"),
);
const PaypalPrePayment = React.lazy(
  () => import("../pages/account/payment/paypal/pre-payment/index"),
);
const StripePrePayment = React.lazy(
  () => import("../pages/account/payment/stripe/pre-payment"),
);
const StripePostPayment = React.lazy(
  () => import("../pages/account/payment/stripe/post-payment"),
);
const StripeCancelPayment = React.lazy(
  () => import("../pages/account/payment/stripe/cancel-payment"),
);
const BuySucceed = React.lazy(() => import("../pages/account/buy-succeed"));
const ExtendSucceed = React.lazy(
  () => import("../pages/account/extend-succeed"),
);
const UpgradeSucceed = React.lazy(
  () => import("../pages/account/upgrade-succeed/index"),
);
const SessionLockScreen = React.lazy(
  () => import("../pages/account/login/session-lock-screen"),
);

// Main/Tenant dashboard
const TenantDashboard = React.lazy(
  () => import("../pages/admin/dashboard/tenant"),
);
const HostDashboard = React.lazy(() => import("../pages/admin/dashboard/host"));

// System pages
const ConnectionFailed = React.lazy(
  () => import("../pages/system/connection-failed"),
);
const InstallPage = React.lazy(() => import("../pages/system/install"));

const DashboardRedirect = React.lazy(() => import("./DashboardRedirect"));

const LoadingSpinner = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      width: "100%",
    }}
  >
    <Spin size="large" />
  </div>
);

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BrowserRouter>
        <Routes>
          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardRedirect />} />
              <Route path="tenant-dashboard" element={<TenantDashboard />} />
              <Route path="host-dashboard" element={<HostDashboard />} />
              <Route path="admin/audit-logs" element={<AuditLogs />} />
              <Route path="admin/users" element={<Users />} />
              <Route path="admin/roles" element={<Roles />} />
              <Route
                path="admin/demo-ui-components"
                element={<DemoUiComponents />}
              />
              <Route path="admin/languages" element={<Languages />} />
              <Route
                path="admin/languages/texts/:languageName"
                element={<LanguageTexts />}
              />
              <Route
                path="admin/settings/tenant"
                element={<TenantSettings />}
              />
              <Route path="admin/settings/host" element={<HostSettings />} />
              <Route
                path="admin/subscription-management"
                element={<SubscriptionManagement />}
              />
              <Route path="admin/tenants" element={<TenantsPage />} />
              <Route path="admin/editions" element={<EditionsPage />} />
              <Route
                path="admin/invoice/:paymentId"
                element={<InvoicePage />}
              />
              <Route
                path="admin/ui-customization"
                element={<UiCustomization />}
              />
              <Route
                path="admin/organization-units"
                element={<OrganizationUnits />}
              />
              <Route
                path="admin/webhook-subscriptions"
                element={<WebhookSubscriptions />}
              />
              <Route
                path="admin/webhook-subscriptions-detail"
                element={<WebhookSubscriptionDetail />}
              />
              <Route
                path="admin/webhook-event-detail"
                element={<WebhookEventDetail />}
              />
              <Route
                path="admin/dynamic-property"
                element={<DynamicEntityProperties />}
              />
              <Route
                path="admin/dynamic-entity-property/:entityFullName"
                element={<DynamicEntityProperties />}
              />
              <Route
                path="admin/dynamic-entity-property-value/manage-all/:entityFullName/:rowId"
                element={<DynamicEntityPropertyValues />}
              />
              <Route path="admin/login-attempts" element={<LoginAttempts />} />
              <Route
                path="admin/active-sessions"
                element={<ActiveSessions />}
              />
              <Route path="admin/maintenance" element={<Maintenance />} />
              <Route path="notifications" element={<Notifications />} />
              <Route
                path="admin/mass-notifications"
                element={<MassNotifications />}
              />
              <Route
                path="admin/entity-changes/:entityTypeFullName/:entityId"
                element={<EntityChanges />}
              />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/account/login" replace />} />

          <Route path="/account" element={<AccountIndex />}>
            <Route index element={<Navigate to="login" replace />} />
            <Route path="login" element={<AccountLogin />} />
            <Route path="register" element={<AccountRegister />} />
            <Route path="register-tenant" element={<RegisterTenant />} />
            <Route
              path="register-tenant-result"
              element={<RegisterTenantResult />}
            />
            <Route path="forgot-password" element={<AccountForgotPassword />} />
            <Route path="reset-password" element={<AccountResetPassword />} />
            <Route
              path="email-activation"
              element={<AccountEmailActivation />}
            />
            <Route path="confirm-email" element={<AccountConfirmEmail />} />
            <Route path="change-email" element={<AccountChangeEmail />} />
            <Route path="send-code" element={<AccountSendTwoFactor />} />
            <Route path="verify-code" element={<AccountVerifyTwoFactor />} />
            <Route
              path="passwordless-login"
              element={<AccountPasswordlessLogin />}
            />
            <Route
              path="verify-passwordless-login"
              element={<AccountVerifyPasswordless />}
            />
            <Route
              path="gateway-selection"
              element={<AccountGatewaySelection />}
            />
            <Route path="select-edition" element={<RegisterSelectEdition />} />
            <Route path="paypal-pre-payment" element={<PaypalPrePayment />} />
            <Route path="stripe-pre-payment" element={<StripePrePayment />} />
            <Route path="stripe-post-payment" element={<StripePostPayment />} />
            <Route
              path="stripe-cancel-payment"
              element={<StripeCancelPayment />}
            />
            <Route path="buy-succeed" element={<BuySucceed />} />
            <Route path="extend-succeed" element={<ExtendSucceed />} />
            <Route path="upgrade-succeed" element={<UpgradeSucceed />} />
            <Route path="session-locked" element={<SessionLockScreen />} />
          </Route>

          <Route path="/connection-failed" element={<ConnectionFailed />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
};

export default AppRouter;
