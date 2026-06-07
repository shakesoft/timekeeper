import React from "react";
import classNames from "classnames";
import { useSession } from "../../../../../hooks/useSession";
import { useSubscriptionNotification } from "../../../../../hooks/useSubscriptionNotification";
import { Link } from "react-router-dom";

type Props = {
  className?: string;
  buttonClassName?: string;
};

const SubscriptionNotificationBar: React.FC<Props> = ({
  className,
  buttonClassName = "btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px position-relative",
}) => {
  const { tenant } = useSession();
  const {
    subscriptionStatusBarVisible,
    subscriptionIsExpiringSoon,
    getTrialSubscriptionNotification,
    getExpireNotification,
  } = useSubscriptionNotification();

  const isInTrial = !!tenant?.isInTrialPeriod;

  if (!subscriptionStatusBarVisible) return null;

  return (
    <div
      className={classNames(
        { "d-none": !subscriptionStatusBarVisible },
        "d-flex align-items-center ms-1 ms-lg-3",
        className,
      )}
    >
      <div
        className={buttonClassName}
        data-kt-menu-trigger="click"
        data-kt-menu-placement={"bottom-start"}
      >
        <i className="flaticon-alert fs-2 glowing" />
        <span className="bullet bullet-dot bg-success h-6px w-6px position-absolute translate-middle top-0 start-50 animation-blink"></span>
      </div>
      <div
        className="menu menu-sub menu-sub-dropdown menu-column w-250px w-lg-400px p-5"
        data-kt-menu="true"
      >
        {isInTrial && !subscriptionIsExpiringSoon && (
          <span
            dangerouslySetInnerHTML={{
              __html: getTrialSubscriptionNotification(),
            }}
          />
        )}
        {subscriptionIsExpiringSoon && (
          <Link to="/app/admin/subscription-management">
            {subscriptionIsExpiringSoon && isInTrial && (
              <span>
                <i className="fa fa-exclamation-triangle" />{" "}
                {getExpireNotification("TrialExpireNotification")}
              </span>
            )}
            {subscriptionIsExpiringSoon && !isInTrial && (
              <span>
                <i className="fa fa-exclamation-triangle" />{" "}
                {getExpireNotification("SubscriptionExpireNotification")}
              </span>
            )}
          </Link>
        )}
      </div>
    </div>
  );
};

export default SubscriptionNotificationBar;
