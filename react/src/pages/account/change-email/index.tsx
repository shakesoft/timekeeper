import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AccountServiceProxy,
  ChangeEmailInput,
  ResolveTenantIdInput,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useSession } from "@/hooks/useSession";

const ChangeEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountService = useServiceProxy(AccountServiceProxy, []);
  const { user } = useSession();
  const cParam = searchParams.get("c") || undefined;
  const [waitMessage, setWaitMessage] = useState<string>("");

  const userIsAuthenticated = useMemo(() => {
    try {
      return !!user?.id;
    } catch {
      return false;
    }
  }, [user?.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWaitMessage(L("PleaseWaitToConfirmYourEmailMessage"));

    const run = async () => {
      try {
        const tenantId = await accountService.resolveTenantId(
          new ResolveTenantIdInput({ c: cParam }),
        );
        const currentTenantId = abp?.multiTenancy?.getTenantIdCookie?.();
        if ((tenantId || null) !== (currentTenantId || null)) {
          abp?.multiTenancy?.setTenantIdCookie?.(tenantId || undefined);
        }

        const input = new ChangeEmailInput();
        input.c = cParam;
        await accountService.changeEmail(input);

        abp?.notify?.success?.(L("YourEmailIsChangedMessage"), "", {
          willClose: () => {
            if (userIsAuthenticated) {
              abp?.utils?.deleteCookie?.("Abp.AuthToken", abp?.appPath);

              navigate("/account/login", { replace: true });
            } else {
              navigate("/account/login", { replace: true });
            }
          },
        });
      } catch {
        navigate("/account/login", { replace: true });
      }
    };

    run();
  }, [accountService, cParam, navigate, userIsAuthenticated]);

  return (
    <div className="login-form">
      <div className="alert alert-success text-center" role="alert">
        <div className="alert-text">{waitMessage}</div>
      </div>
    </div>
  );
};

export default ChangeEmailPage;
