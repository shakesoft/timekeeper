export function getDashboardUrl(tenantId?: number | null): string {
  const effectiveTenantId =
    tenantId !== undefined ? tenantId : abp?.session?.tenantId;
  const isHost = !effectiveTenantId;

  if (isHost && abp?.auth?.isGranted?.("Pages.Administration.Host.Dashboard")) {
    return "/app/host-dashboard";
  }

  if (!isHost && abp?.auth?.isGranted?.("Pages.Tenant.Dashboard")) {
    return "/app/tenant-dashboard";
  }

  return "/app/notifications";
}
