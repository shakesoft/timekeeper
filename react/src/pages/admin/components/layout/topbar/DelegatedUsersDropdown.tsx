import React, { useEffect, useState } from "react";
import classNames from "classnames";
import {
  UserDelegationServiceProxy,
  type UserDelegationDto,
} from "../../../../../api/generated/service-proxies";
import { useSession } from "../../../../../hooks/useSession";
import { useImpersonation } from "../../../users/hooks/useImpersonation";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import AppConsts from "@/lib/app-consts";

type Props = {
  className?: string;
  buttonClassName?: string;
};

const DelegatedUsersDropdown: React.FC<Props> = ({
  className,
  buttonClassName = "btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px",
}) => {
  const userDelegationService = useServiceProxy(UserDelegationServiceProxy, []);
  const { delegatedImpersonate } = useImpersonation();
  const { tenant } = useSession();

  const [delegations, setDelegations] = useState<UserDelegationDto[]>([]);

  useEffect(() => {
    let mounted = true;
    userDelegationService
      .getActiveUserDelegations()
      .then((result) => {
        if (mounted) setDelegations(result || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [userDelegationService]);

  const switchToUser = (delegation: UserDelegationDto) => {
    const username = delegation.username || "";

    abp.message.confirm(
      L("SwitchToDelegatedUserWarningMessage", [username]),
      L("AreYouSure"),
      (confirmed) => {
        if (confirmed) {
          delegatedImpersonate(delegation.id, tenant?.id ?? undefined);
        }
      },
    );
  };

  if (!delegations?.length) return null;

  return (
    <>
      <div
        className={classNames(
          "d-flex align-items-center ms-1 ms-lg-3 active-user-delegations",
          className,
        )}
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom-start"
      >
        <div className={buttonClassName} title={L("SwitchToUser")}>
          <i className="ki-duotone ki-profile-user fs-2">
            <span className="path1"></span>
            <span className="path2"></span>
            <span className="path3"></span>
            <span className="path4"></span>
          </i>
        </div>
      </div>
      <div
        className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-semibold w-250px w-md-300px py-4"
        data-kt-menu="true"
      >
        <div className="menu-item px-3">
          <div className="menu-content text-muted pb-2 px-3 fs-7">
            {L("SwitchToUser")}
          </div>
        </div>
        <div className="separator mb-3 opacity-75"></div>
        {delegations.map((d) => (
          <div className="menu-item px-3" key={d.id}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                switchToUser(d);
              }}
              className="menu-link px-3 d-flex flex-column"
            >
              <span className="fs-8 text-gray-800">
                {d.username} (
                {L("ExpiresAt", [
                  d.endTime?.format(AppConsts.timing.longDateFormat) || "",
                ])}
                )
              </span>
            </a>
          </div>
        ))}
      </div>
    </>
  );
};

export default DelegatedUsersDropdown;
