import { useCallback } from "react";
import {
  AccountServiceProxy,
  SwitchToLinkedAccountInput,
  type LinkedUserDto,
} from "@/api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import { AppPreBootstrap } from "@/app/bootstrap/AppPreBootstrap";
import AppConsts from "@/lib/app-consts";
import L from "@/lib/L";

export function useLinkedAccount() {
  const accountService = useServiceProxy(AccountServiceProxy, []);

  const switchToLinkedAccount = useCallback(
    async (linkedUser: LinkedUserDto) => {
      try {
        const input = new SwitchToLinkedAccountInput();
        input.targetUserId = linkedUser.id;
        input.targetTenantId = linkedUser.tenantId;

        const result = await accountService.switchToLinkedAccount(input);

        if (result.switchAccountToken) {
          AppPreBootstrap.linkedAccountAuthenticate(
            result.switchAccountToken,
            linkedUser.tenantId ?? 0,
            () => {
              window.location.href = AppConsts.appBaseUrl + "/app";
            },
          );
        }
      } catch {
        abp.message?.error?.(L("AnErrorOccurred"));
      }
    },
    [accountService],
  );

  return { switchToLinkedAccount };
}
