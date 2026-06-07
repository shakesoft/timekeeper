import React, { useEffect, useRef, useState } from "react";
import { Table, DatePicker, App } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  NotificationServiceProxy,
  UserNotificationState,
  IUserNotification,
  EntityDtoOfGuid,
} from "../../../api/generated/service-proxies";
import PageHeader from "../components/common/PageHeader";
import {
  formatDate,
  fromNow,
  getEndOfDay,
  getEndOfDayForDate,
  getStartOfDay,
  getStartOfDayForDate,
} from "../components/common/timing/lib/datetime-helper";
import {
  getNotificationTextBySeverity,
  formatAbpUserNotification,
} from "./utils";
import NotificationSettingsModal, {
  type NotificationSettingsModalHandle,
} from "./NotificationSettingsModal";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useTheme } from "@/hooks/useTheme";
import { Dayjs } from "dayjs";
import AppConsts from "@/lib/app-consts";

const { RangePicker } = DatePicker;

enum ReadStateFilter {
  All = "ALL",
  Unread = "UNREAD",
}

const NotificationsPage: React.FC = () => {
  const notificationService = useServiceProxy(NotificationServiceProxy, []);
  const { containerClass } = useTheme();

  const [readStateFilter, setReadStateFilter] = useState<ReadStateFilter>(
    ReadStateFilter.All,
  );
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >([getStartOfDay(), getEndOfDay()]);
  type NotificationRow = {
    notification: { id: string };
    formattedNotification: {
      state: string;
      isUnread: boolean;
      severity: number;
      icon: string;
      iconFontClass: string;
      url: string;
      text: string;
      creationTime: Dayjs;
    };
  };
  const [records, setRecords] = useState<NotificationRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ skip: 0, take: 10 });
  const [refreshKey, setRefreshKey] = useState(0);

  const settingsModalRef = useRef<NotificationSettingsModalHandle>(null);
  const { modal } = App.useApp();

  useEffect(() => {
    let cancelled = false;
    const state =
      readStateFilter === ReadStateFilter.All
        ? undefined
        : UserNotificationState.Unread;
    const start = dateRange?.[0]
      ? getStartOfDayForDate(dateRange[0]!)
      : undefined;
    const end = dateRange?.[1] ? getEndOfDayForDate(dateRange[1]!) : undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    notificationService
      .getUserNotifications(state, start, end, pagination.take, pagination.skip)
      .then((result) => {
        if (cancelled) return;
        setTotalCount(result.totalCount);
        const items = (result.items || []) as unknown as IUserNotification[];
        setRecords(
          items.map((r) => ({
            notification: r,
            formattedNotification: formatAbpUserNotification(r, false),
          })),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dateRange, readStateFilter, notificationService, pagination, refreshKey]);

  const reload = () => {
    setPagination((p) => ({ ...p, skip: 0 }));
    setRefreshKey((k) => k + 1);
  };

  const setAllAsRead = async () => {
    await notificationService.setAllNotificationsAsRead();
    abp?.event?.trigger?.("app.notifications.refresh");
    reload();
  };

  const setAsRead = async (record: NotificationRow) => {
    if (!record.formattedNotification.isUnread) return;
    await notificationService.setNotificationAsRead({
      id: record.notification.id,
    } as EntityDtoOfGuid);
    reload();
  };

  const deleteNotification = async (notification: { id: string }) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      modal.confirm({
        title: L("AreYouSure"),
        content: L("NotificationDeleteWarningMessage"),
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
    if (!confirmed) return;
    await notificationService.deleteNotification(notification.id);
    abp?.notify?.success?.(L("SuccessfullyDeleted"));
    reload();
  };

  const deleteNotifications = async () => {
    const confirmed = await new Promise<boolean>((resolve) => {
      modal.confirm({
        title: L("AreYouSure"),
        content: L("DeleteListedNotificationsWarningMessage"),
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
    if (!confirmed) return;
    await notificationService.deleteAllUserNotifications(
      readStateFilter === ReadStateFilter.All
        ? undefined
        : UserNotificationState.Unread,
      dateRange?.[0] ? getStartOfDayForDate(dateRange[0]!) : undefined,
      dateRange?.[1] ? getEndOfDayForDate(dateRange[1]!) : undefined,
    );
    abp?.notify?.success?.(L("SuccessfullyDeleted"));
    reload();
  };

  const columns: ColumnsType<NotificationRow> = [
    {
      title: L("Actions"),
      width: 130,
      align: "center" as const,
      render: (_: unknown, record) => (
        <div className="d-flex gap-2 justify-content-start">
          <button
            className="btn btn-sm btn-icon btn-primary"
            title={record.formattedNotification.isUnread ? L("SetAsRead") : ""}
            onClick={() => void setAsRead(record)}
            disabled={!record.formattedNotification.isUnread}
          >
            {!record.formattedNotification.isUnread ? (
              <i className="fa fa-check" aria-label={L("Read")} />
            ) : (
              <i className="fa fa-circle-notch" aria-label={L("Unread")} />
            )}
          </button>
          <button
            className="btn btn-sm btn-icon btn-danger"
            title={L("Delete")}
            onClick={() => void deleteNotification(record.notification)}
          >
            <i className="la la-times" aria-label={L("Delete")} />
          </button>
        </div>
      ),
    },
    {
      title: L("Severity"),
      width: 80,
      align: "center" as const,
      render: (_: unknown, record) => (
        <i
          className={`${record.formattedNotification.icon} ${record.formattedNotification.iconFontClass} fa-2x`}
          title={getNotificationTextBySeverity(
            record.formattedNotification.severity,
          )}
        />
      ),
    },
    {
      title: L("Notification"),
      dataIndex: "formattedNotification",
      render: (f: NotificationRow["formattedNotification"]) =>
        f.url ? (
          <a
            href={f.url}
            className={!f.isUnread ? "notification-read text-muted" : ""}
          >
            {f.text}
          </a>
        ) : (
          <span
            title={f.text}
            className={!f.isUnread ? "notification-read text-muted" : ""}
          >
            {f.text}
          </span>
        ),
    },
    {
      title: L("CreationTime"),
      width: 220,
      align: "center" as const,
      render: (_: unknown, record) => (
        <span
          title={formatDate(
            record.formattedNotification.creationTime,
            AppConsts.timing.longDateFormat,
          )}
          className={
            !record.formattedNotification.isUnread
              ? "notification-read text-muted"
              : ""
          }
        >
          {fromNow(record.formattedNotification.creationTime)}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={L("Notifications")}
        actions={
          <>
            <button
              className="btn btn-success d-flex align-items-center"
              onClick={() => settingsModalRef.current?.show()}
            >
              <i className="fa fa-cog btn-md-icon" />
              <span className="d-none d-md-inline-block">
                {" "}
                {L("NotificationSettings")}
              </span>
            </button>
            <button
              className="btn btn-primary ms-2 d-flex align-items-center"
              onClick={() => void setAllAsRead()}
            >
              <i className="fa fa-check btn-md-icon" />
              <span className="d-none d-md-inline-block">
                {" "}
                {L("SetAllAsRead")}
              </span>
            </button>
          </>
        }
      />
      <div className={containerClass}>
        <div className="card card-custom">
          <div className="card-body">
            <div className="form">
              <div className="row mb-4">
                <div className="col-xl-6">
                  <RangePicker
                    className="form-control d-inline-flex"
                    value={dateRange}
                    onChange={(value) =>
                      setDateRange(
                        value as
                          | [
                              import("dayjs").Dayjs | null,
                              import("dayjs").Dayjs | null,
                            ]
                          | null,
                      )
                    }
                  />
                </div>
                <div className="col-xl-6">
                  <div className="mb-5">
                    <select
                      className="form-control"
                      value={readStateFilter}
                      onChange={(e) =>
                        setReadStateFilter(e.target.value as ReadStateFilter)
                      }
                      name="readStateFilter"
                    >
                      <option value={ReadStateFilter.All}>{L("All")}</option>
                      <option value={ReadStateFilter.Unread}>
                        {L("Unread")}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-xl-12 text-end">
                  <div className="mb-5">
                    <button
                      className="btn btn-danger"
                      onClick={() => void deleteNotifications()}
                    >
                      <i className="la la-times" />{" "}
                      {L("DeleteListedNotifications")}
                    </button>
                    <button
                      className="btn btn-primary ms-2"
                      onClick={() => reload()}
                    >
                      <i className="fa fa-sync" /> {L("Refresh")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Table<NotificationRow>
              dataSource={records}
              columns={columns}
              loading={loading}
              rowKey={(r) => r.notification.id as string}
              pagination={{
                total: totalCount,
                pageSize: 10,
                showTotal: (t) => `${L("Total")}: ${t}`,
                onChange: (p, ps) =>
                  setPagination({ skip: (p - 1) * ps, take: ps }),
              }}
            />
          </div>
        </div>
      </div>
      <NotificationSettingsModal ref={settingsModalRef} />
    </>
  );
};

export default NotificationsPage;
