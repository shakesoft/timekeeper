import React, { useCallback, useEffect, useState } from "react";
import classNames from "classnames";
import {
  EntityDtoOfGuid,
  IUserNotification,
  NotificationServiceProxy,
} from "../../../../../api/generated/service-proxies";
import {
  type FormattedUserNotification,
  formatAbpUserNotification,
  showUiAndDesktopNotification,
  shouldUserUpdateApp,
} from "../../../notifications/utils";
import NotificationSettingsModal, {
  type NotificationSettingsModalHandle,
} from "../../../notifications/NotificationSettingsModal";
import { fromNow } from "../../common/timing/lib/datetime-helper";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { Link } from "react-router-dom";

type Props = {
  customStyle?: string;
  iconStyle?: string;
  right?: boolean;
};

const HeaderNotifications: React.FC<Props> = ({
  customStyle = "btn btn-active-color-primary btn-active-light btn-custom btn-icon btn-icon-muted h-35px h-md-40px position-relative w-35px w-md-40px",
  iconStyle = "flaticon-alert-2 unread-notification fs-4",
  right = true,
}) => {
  const notificationService = useServiceProxy(NotificationServiceProxy, []);
  const [notifications, setNotifications] = useState<
    FormattedUserNotification[]
  >([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const settingsModalRef = React.useRef<NotificationSettingsModalHandle>(null);

  const loadNotifications = useCallback(async () => {
    const result = await notificationService.getUserNotifications(
      undefined,
      undefined,
      undefined,
      3,
      0,
    );
    setUnreadCount(result.unreadCount);
    const items = (result.items || []) as unknown as IUserNotification[];
    setNotifications(items.map((n) => formatAbpUserNotification(n)));
    await shouldUserUpdateApp(notificationService);
  }, [notificationService]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadNotifications();
    const onReceived = (userNotification: IUserNotification) => {
      showUiAndDesktopNotification(userNotification);
      void loadNotifications();
    };
    abp?.event?.on?.("abp.notifications.received", onReceived);

    const onRefresh = () => void loadNotifications();
    abp?.event?.on?.("app.notifications.refresh", onRefresh);

    const onRead = (userNotificationId: string, success: boolean) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.userNotificationId === userNotificationId
            ? { ...n, state: "READ", isUnread: false }
            : n,
        ),
      );
      if (success) setUnreadCount((c) => Math.max(0, c - 1));
    };
    abp?.event?.on?.("app.notifications.read", onRead);
  }, [loadNotifications]);

  const setAllAsRead = async () => {
    await notificationService.setAllNotificationsAsRead();
    abp?.event?.trigger?.("app.notifications.refresh");
  };

  const setAsRead = async (n: FormattedUserNotification) => {
    if (!n || !n.isUnread) return;
    const input = { id: n.userNotificationId } as EntityDtoOfGuid;
    const result = await notificationService.setNotificationAsRead(input);
    abp?.event?.trigger?.(
      "app.notifications.read",
      n.userNotificationId,
      (result as { success: boolean }).success,
    );
  };

  const menu = (
    <div
      className={classNames(
        "menu menu-sub menu-sub-dropdown menu-column w-200px w-sm-250px w-md-400px",
      )}
      data-kt-menu="true"
    >
      <div
        className="d-flex flex-column pt-5 bgi-size-cover bgi-no-repeat rounded-top bg-primary"
        style={{ minHeight: 70 }}
      >
        <h4 className="d-flex flex-center align-items-center justify-content-between">
          <span className="ms-5">
            <span className="text-white">{L("Notifications")}</span>
            <span className="btn btn-text btn-secondary btn-sm fw-bold btn-font-md ms-2">
              {unreadCount} {L("New")}
            </span>
          </span>
          <a
            id="openNotificationSettingsModalLink"
            className="btn btn-md btn-icon btn-secondary me-5"
            href="#"
            data-kt-menu-dismiss="true"
            onClick={(e) => {
              e.preventDefault();
              settingsModalRef.current?.show();
            }}
          >
            <i className="flaticon2-gear" />
          </a>
        </h4>
      </div>
      <div className="px-4">
        <div
          className="scroll pt-5"
          style={{ height: 300, overflow: "hidden" }}
        >
          {notifications.map((n) => (
            <div
              key={n.userNotificationId}
              className={classNames(
                "d-flex align-items-sm-center mb-7 user-notification-item-clickable",
                { "user-notification-item-unread": n.isUnread },
              )}
            >
              <div className="symbol symbol-50px me-5">
                <span className="symbol-label">
                  <i className={`${n.icon} ${n.iconFontClass} icon-lg`} />
                </span>
              </div>
              <div className="d-flex align-items-center flex-row-fluid flex-wrap">
                <div className="flex-grow-1 me-2">
                  <Link
                    className={classNames("text-hover-primary fs-6 fw-bolder", {
                      "text-muted": !n.isUnread,
                    })}
                    to={n.url}
                    data-kt-menu-dismiss="true"
                  >
                    {n.text}
                  </Link>
                </div>
                <span className="text-muted fw-bold d-block fs-7">
                  {fromNow(n.creationTime)}
                </span>
                {n.isUnread && (
                  <span
                    className="btn btn-link-success text-success set-notification-as-read fs-7 py-0 my-0"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void setAsRead(n);
                    }}
                  >
                    {L("SetAsRead")}
                  </span>
                )}
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <span className="notification-empty-text text-center p-5">
              {L("ThereAreNoNotifications")}
            </span>
          )}
        </div>
        {notifications.length > 0 && <hr />}
        {notifications.length > 0 && (
          <div
            className="m-1 mb-4 d-flex"
            style={{ alignItems: "center", justifyContent: "space-between" }}
          >
            {unreadCount > 0 && (
              <a
                href="#"
                className="btn btn-secondary btn-sm col-md-6 col-xs-12"
                data-kt-menu-dismiss="true"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void setAllAsRead();
                }}
                id="setAllNotificationsAsReadLink"
              >
                {L("SetAllAsRead")}
              </a>
            )}
            <Link
              to="/app/notifications"
              className={classNames(
                "btn btn-primary btn-sm col-xs-12",
                unreadCount ? "col-md-6" : "col-md-12",
              )}
              data-kt-menu-dismiss="true"
            >
              {L("SeeAll")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div
        className={classNames("d-flex align-items-center", customStyle)}
        id="notificationIcon"
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
        data-kt-menu-placement={right ? "bottom-end" : "bottom-start"}
      >
        {unreadCount > 0 ? (
          <i className={iconStyle} />
        ) : (
          <i className="flaticon-alarm" />
        )}
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge badge-circle badge-warning">
            {unreadCount}
          </span>
        )}
      </div>
      {menu}
      <NotificationSettingsModal ref={settingsModalRef} />
    </>
  );
};

export default HeaderNotifications;
