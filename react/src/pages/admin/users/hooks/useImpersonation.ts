import { useCallback } from "react";
import {
  AccountServiceProxy,
  ImpersonateTenantInput,
  ImpersonateUserInput,
  DelegatedImpersonateInput,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import AppConsts from "@/lib/app-consts";

export interface UseImpersonationReturn {
  impersonateTenant: (userId: number, tenantId?: number) => Promise<void>;
  impersonateUser: (userId: number, tenantId?: number) => Promise<void>;
  delegatedImpersonate: (
    userDelegationId: number,
    tenantId?: number,
  ) => Promise<void>;
  backToImpersonator: () => Promise<void>;
}

export const useImpersonation = (): UseImpersonationReturn => {
  const accountService = useServiceProxy(AccountServiceProxy, []);

  const impersonateTenant = useCallback(
    async (userId: number, tenantId?: number) => {
      const input = new ImpersonateTenantInput();
      input.userId = userId;
      input.tenantId = tenantId;
      const result = await accountService.impersonateTenant(input);
      let targetUrl = `${AppConsts.appBaseUrl}?impersonationToken=${encodeURIComponent(result.impersonationToken || "")}`;
      if (tenantId) {
        targetUrl += `&tenantId=${tenantId}`;
      }
      window.location.href = targetUrl;
    },
    [accountService],
  );

  const impersonateUser = useCallback(
    async (userId: number, tenantId?: number) => {
      const input = new ImpersonateUserInput();
      input.userId = userId;
      input.tenantId = tenantId;
      const result = await accountService.impersonateUser(input);
      let targetUrl = `${AppConsts.appBaseUrl}?impersonationToken=${encodeURIComponent(result.impersonationToken || "")}`;
      if (tenantId) {
        targetUrl += `&tenantId=${tenantId}`;
      }
      window.location.href = targetUrl;
    },
    [accountService],
  );

  const delegatedImpersonate = useCallback(
    async (userDelegationId: number, tenantId?: number) => {
      const input = new DelegatedImpersonateInput();
      input.userDelegationId = userDelegationId;
      const result = await accountService.delegatedImpersonate(input);
      let targetUrl = `${AppConsts.appBaseUrl}?impersonationToken=${encodeURIComponent(result.impersonationToken || "")}&userDelegationId=${userDelegationId}`;
      if (tenantId) {
        targetUrl += `&tenantId=${tenantId}`;
      }
      window.location.href = targetUrl;
    },
    [accountService],
  );

  const backToImpersonator = useCallback(async () => {
    const result = await accountService.backToImpersonator();
    let targetUrl = `${AppConsts.appBaseUrl}?impersonationToken=${encodeURIComponent(result.impersonationToken || "")}`;
    if (abp?.session?.impersonatorTenantId) {
      targetUrl += `&tenantId=${abp.session.impersonatorTenantId}`;
    }
    window.location.href = targetUrl;
  }, [accountService]);

  return {
    impersonateTenant,
    impersonateUser,
    delegatedImpersonate,
    backToImpersonator,
  };
};

export default useImpersonation;
