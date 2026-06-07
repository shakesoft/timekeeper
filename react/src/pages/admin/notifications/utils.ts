import Push from "push.js";
import AppConsts from "../../../lib/app-consts";
import {
  IUserNotification,
  NotificationServiceProxy,
  NotificationSeverity,
  UserNotificationState,
} from "../../../api/generated/service-proxies";
import L from "@/lib/L";
import apiHttp from "@/api/http-client";
import { Dayjs } from "dayjs";
import {
  formatDate,
  getLocalDate,
} from "../components/common/timing/lib/datetime-helper";

export interface FormattedUserNotification {
  userNotificationId: string;
  text: string;
  time: string;
  creationTime: Dayjs;
  icon: string;
  state: string;
  data: unknown;
  url: string;
  isUnread: boolean;
  severity: number;
  iconFontClass: string;
}

export const getUiIconBySeverity = (severity: number): string => {
  switch (severity) {
    case 1:
      return "fas fa-check-circle";
    case 2:
      return "fas fa-exclamation-triangle";
    case 3:
      return "fas fa-exclamation-circle";
    case 4:
      return "fas fa-bomb";
    case 0:
    default:
      return "fas fa-info-circle";
  }
};

export const getIconFontClassBySeverity = (severity: number): string => {
  switch (severity) {
    case 1:
      return " text-success";
    case 2:
      return " text-warning";
    case 3:
    case 4:
      return " text-danger";
    case 0:
    default:
      return " text-info";
  }
};

export const getUrl = (userNotification: IUserNotification): string => {
  const n = userNotification.notification;
  const props = (n?.data?.properties || {}) as Record<string, string>;
  switch (n.notificationName) {
    case "App.NewUserRegistered":
      return `/app/admin/users?filterText=${encodeURIComponent(
        props.emailAddress || "",
      )}`;
    case "App.NewTenantRegistered":
      return `/app/admin/tenants?filterText=${encodeURIComponent(
        props.tenancyName || "",
      )}`;
    case "App.GdprDataPrepared":
      return (
        `${AppConsts.remoteServiceBaseUrl}/File/DownloadBinaryFile?id=${props.binaryObjectId}` +
        `&contentType=application/zip&fileName=collectedData.zip`
      );
    case "App.DownloadInvalidImportUsers":
      return (
        `${AppConsts.remoteServiceBaseUrl}/File/DownloadTempFile?fileToken=${props.fileToken}` +
        `&fileType=${props.fileType}&fileName=${props.fileName}`
      );
    default:
      return "";
  }
};

export const formatAbpUserNotification = (
  userNotification: IUserNotification,
  truncateText: boolean = true,
): FormattedUserNotification => {
  const message: string = abp?.notifications
    ?.getFormattedMessageFromUserNotification
    ? abp.notifications.getFormattedMessageFromUserNotification(
        userNotification as unknown as abp.notifications.IUserNotification,
      )
    : JSON.stringify(userNotification.notification?.data ?? {});

  const time = userNotification.notification?.creationTime || getLocalDate();
  const text =
    truncateText && abp?.utils?.truncateStringWithPostfix
      ? abp.utils.truncateStringWithPostfix(message, 100)
      : message;

  const stateStr = abp?.notifications?.getUserNotificationStateAsString
    ? abp.notifications.getUserNotificationStateAsString(
        userNotification.state as unknown as abp.notifications.userNotificationState.UNREAD,
      )
    : userNotification.state === UserNotificationState.Unread
      ? "UNREAD"
      : "READ";

  return {
    userNotificationId: userNotification.id,
    text,
    time: formatDate(time, AppConsts.timing.shortDateFormat),
    creationTime: time,
    icon: getUiIconBySeverity(userNotification.notification.severity),
    state: stateStr,
    data: userNotification.notification.data,
    url: getUrl(userNotification),
    isUnread: userNotification.state === UserNotificationState.Unread,
    severity: userNotification.notification.severity,
    iconFontClass: getIconFontClassBySeverity(
      userNotification.notification.severity,
    ),
  };
};

export const showUiAndDesktopNotification = (
  userNotification: IUserNotification,
): void => {
  const url = getUrl(userNotification);
  if (abp?.notifications?.showUiNotifyForUserNotification) {
    abp.notifications.showUiNotifyForUserNotification(
      userNotification as unknown as abp.notifications.IUserNotification,
      {
        didOpen: (toast: unknown) => {
          const toastElement = toast as HTMLElement;
          toastElement.addEventListener("click", () => {
            if (url) {
              location.href = url;
            }
          });
        },
      },
    );
  }
  if (Push.Permission?.has?.()) {
    Push.create("CadentManagement", {
      body: formatAbpUserNotification(userNotification).text,
      icon: `${AppConsts.appBaseUrl}/assets/common/images/app-logo-on-dark-sm.svg`,
      timeout: 6000,
      onClick: function onClick(this: Notification) {
        window.focus();
        this.close();
      },
    });
  }
};

export const shouldUserUpdateApp = async (
  svc: NotificationServiceProxy,
): Promise<void> => {
  const result = await svc.shouldUserUpdateApp();
  if (!result) return;

  const confirm = await new Promise<boolean>((resolve) =>
    abp!.message!.confirm(L("NewVersionAvailableNotification"), "", resolve),
  );

  if (confirm) {
    const { data: cleared } = await apiHttp().post<boolean>(
      "/BrowserCacheCleaner/Clear",
    );

    if (cleared) {
      const url = new URL(location.href);
      url.searchParams.set("t", Date.now().toString());
      location.href = url.toString();
    }
  }
};

export const getNotificationTextBySeverity = (
  severity: NotificationSeverity,
): string => {
  switch (severity) {
    case NotificationSeverity.Success:
      return L("Success");
    case NotificationSeverity.Warn:
      return L("Warning");
    case NotificationSeverity.Error:
      return L("Error");
    case NotificationSeverity.Fatal:
      return L("Fatal");
    case NotificationSeverity.Info:
    default:
      return L("Info");
  }
};
