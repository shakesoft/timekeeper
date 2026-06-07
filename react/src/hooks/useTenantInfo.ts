import { useMemo } from "react";
import { useSession } from "@/hooks/useSession";

export function getTenantIdFromCookie(): number | string | null {
  const id = abp?.multiTenancy?.getTenantIdCookie?.();
  if (id) return id;
  const cookieName = abp?.multiTenancy?.tenantIdCookieName || "Abp-TenantId";
  const re = new RegExp(
    "(?:^|; )" +
      cookieName.replace(/([.$?*|{}()[\\/+^])/g, "\\$1") +
      "=([^;]*)",
  );
  const m = document.cookie.match(re);
  return m ? decodeURIComponent(m[1]) : null;
}

export function getTenancyNameFromStorage(): string {
  return localStorage.getItem("ABP_TENANCY_NAME") || "";
}

export function useResolvedTenant(): {
  tenantId: number | string | null;
  tenancyName: string;
  hasTenant: boolean;
} {
  const { tenant } = useSession();
  const value = useMemo(() => {
    const tenantId =
      (tenant?.id as number | string | undefined) ??
      (abp?.session?.tenantId as number | string | undefined) ??
      getTenantIdFromCookie();
    const tenancyName =
      (tenant?.tenancyName as string | undefined)?.trim() ||
      getTenancyNameFromStorage() ||
      "";
    return {
      tenantId: tenantId ?? null,
      tenancyName,
      hasTenant: !!tenantId,
    };
  }, [tenant?.id, tenant?.tenancyName]);
  return value;
}
