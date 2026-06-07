import React, { useState, useEffect, useCallback } from "react";
import { Table, DatePicker } from "antd";
import {
  NotificationServiceProxy,
  type GetNotificationsCreatedByUserOutput,
} from "@api/generated/service-proxies";
import { useDataTable } from "../../../hooks/useDataTable";
import { usePermissions } from "../../../hooks/usePermissions";
import PageHeader from "../components/common/PageHeader";
import CreateMassNotificationModal from "./components/CreateMassNotificationModal";
import { formatDate } from "../components/common/timing/lib/datetime-helper";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { Dayjs } from "dayjs";
import AppConsts from "@/lib/app-consts";
import { useTheme } from "@/hooks/useTheme";

const { RangePicker } = DatePicker;

const MassNotificationsPage: React.FC = () => {
  const { isGranted } = usePermissions();
  const notificationService = useServiceProxy(NotificationServiceProxy, []);

  const { containerClass } = useTheme();
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const fetchFunction = useCallback(
    () =>
      notificationService.getNotificationsPublishedByUser(
        dateRange?.[0] || undefined,
        dateRange?.[1] || undefined,
      ),
    [dateRange, notificationService],
  );

  const { records, loading, fetchData } =
    useDataTable<GetNotificationsCreatedByUserOutput>(fetchFunction);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSeverityBadge = (severity: number) => {
    const severityMap: Record<number, string> = {
      0: "badge-info",
      1: "badge-success",
      2: "badge-warning",
      3: "badge-danger",
      4: "badge-danger",
    };
    const severityTextMap: Record<number, string> = {
      0: "Info",
      1: "Success",
      2: "Warn",
      3: "Error",
      4: "Fatal",
    };
    return (
      <span className={`badge ${severityMap[severity]}`}>
        {L(severityTextMap[severity])}
      </span>
    );
  };

  const columns = [
    {
      title: L("Message"),
      dataIndex: "data",
      width: 300,
      render: (_: unknown, record: GetNotificationsCreatedByUserOutput) => {
        try {
          const data = record.data as Record<string, unknown> | string | null;
          if (!data) return "-";

          if (typeof data === "string") {
            const parsed = JSON.parse(data) as {
              message?: string;
              Message?: string;
            };
            return parsed?.message || parsed?.Message || "-";
          }

          if (typeof data === "object" && data !== null) {
            const dataObject = data as {
              properties?: { Message?: string };
              message?: string;
              Message?: string;
            };
            if (dataObject.properties) {
              const messageProperty = dataObject.properties.Message;
              if (messageProperty) {
                const parsedMessage =
                  typeof messageProperty === "string"
                    ? (JSON.parse(messageProperty) as {
                        message?: string;
                        Message?: string;
                      })
                    : messageProperty;
                return (
                  (parsedMessage as { message?: string; Message?: string })
                    ?.message ||
                  (parsedMessage as { message?: string; Message?: string })
                    ?.Message ||
                  "-"
                );
              }
            }

            return dataObject?.message || dataObject?.Message || "-";
          }

          return "-";
        } catch {
          return "-";
        }
      },
    },
    {
      title: L("Severity"),
      dataIndex: "severity",
      width: 120,
      render: (severity: number) => getSeverityBadge(severity),
    },
    {
      title: L("CreationTime"),
      dataIndex: "creationTime",
      width: 180,
      render: (text: string) =>
        formatDate(text, AppConsts.timing.shortDateFormat),
    },
    {
      title: L("IsPublished"),
      dataIndex: "isPublished",
      width: 120,
      render: (isPublished: boolean) => (
        <span
          className={`badge ${isPublished ? "badge-success" : "badge-dark"}`}
        >
          {L(isPublished ? "Yes" : "No")}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={L("MassNotifications")}
        actions={
          <div className="d-flex gap-2">
            {isGranted("Pages.Administration.MassNotification") && (
              <button
                type="button"
                className="btn btn-primary d-inline-flex align-items-center"
                onClick={() => setCreateModalVisible(true)}
              >
                <i className="fa fa-plus me-2 align-middle"></i>
                <span className="align-middle">
                  {L("CreateNewMassNotification")}
                </span>
              </button>
            )}
            <button
              type="button"
              className="btn btn-outline-primary d-inline-flex align-items-center"
              onClick={fetchData}
            >
              <i className="fa fa-sync me-2 align-middle"></i>
              <span className="align-middle">{L("Refresh")}</span>
            </button>
          </div>
        }
      />
      <div className={containerClass}>
        <div className="card card-custom gutter-b">
          <div className="card-body">
            <div className="mb-4">
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
            <Table
              dataSource={records}
              columns={columns}
              loading={loading}
              rowKey={(record, index) =>
                (record as { id?: string | number }).id?.toString() ||
                `notification-${index}`
              }
              pagination={false}
              scroll={{ x: 800 }}
            />
          </div>
        </div>
      </div>
      <CreateMassNotificationModal
        isVisible={isCreateModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSave={fetchData}
      />
    </div>
  );
};
export default MassNotificationsPage;
