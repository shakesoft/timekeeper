import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Table, Tag, App } from "antd";
import {
  UserSessionDto,
  UserSessionServiceProxy,
  EntityDtoOfInt64,
} from "@api/generated/service-proxies";
import { formatDate } from "../components/common/timing/lib/datetime-helper";
import PageHeader from "../components/common/PageHeader";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import AppConsts from "@/lib/app-consts";
import { useTheme } from "@/hooks/useTheme";

const ActiveSessionsPage: React.FC = () => {
  const userSessionService = useServiceProxy(UserSessionServiceProxy, []);
  const { containerClass } = useTheme();

  const isRevocationEnabled = useMemo(
    () =>
      !!abp?.setting?.getBoolean?.(
        "App.UserManagement.SessionManagement.IsSessionRevocationEnabled",
      ),
    [],
  );
  const { modal } = App.useApp();

  const [sessions, setSessions] = useState<UserSessionDto[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await userSessionService.getSessions(undefined);
      setSessions(result.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [userSessionService]);

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasOtherSessions = sessions.some((s) => !s.isCurrent);

  const revokeSession = (session: UserSessionDto) => {
    modal.confirm({
      title: L("AreYouSure"),
      content: L("RevokeSessionConfirmation"),
      onOk: async () => {
        const input = new EntityDtoOfInt64();
        input.id = session.id;
        await userSessionService.revokeSession(input);
        abp.notify.success(L("SessionRevoked"));
        await fetchSessions();
      },
    });
  };

  const revokeAllOtherSessions = () => {
    modal.confirm({
      title: L("AreYouSure"),
      content: L("RevokeAllOtherSessionsConfirmation"),
      onOk: async () => {
        await userSessionService.revokeAllOtherSessions();
        abp.notify.success(L("AllOtherSessionsRevoked"));
        await fetchSessions();
      },
    });
  };

  const columns = [
    {
      title: L("DeviceInfo"),
      dataIndex: "deviceInfo",
      render: (text: string) => (
        <>
          <i className="fa fa-desktop me-2"></i>
          {text || L("Unknown")}
        </>
      ),
    },
    {
      title: L("IpAddress"),
      dataIndex: "ipAddress",
      render: (text: string) => text || "-",
    },
    {
      title: L("SignInTime"),
      dataIndex: "signInTime",
      render: (text: string) =>
        formatDate(text, AppConsts.timing.longDateFormat),
    },
    {
      title: L("LastActivityTime"),
      dataIndex: "lastActivityTime",
      render: (text: string) =>
        formatDate(text, AppConsts.timing.longDateFormat),
    },
    {
      title: L("Status"),
      dataIndex: "isCurrent",
      render: (_: unknown, record: UserSessionDto) =>
        record.isCurrent ? (
          <Tag color="success">{L("CurrentSession")}</Tag>
        ) : (
          <Tag color="blue">{L("Active")}</Tag>
        ),
    },
    ...(isRevocationEnabled
      ? [
          {
            title: L("Actions"),
            width: 100,
            align: "center" as const,
            render: (_: unknown, record: UserSessionDto) =>
              !record.isCurrent ? (
                <button
                  type="button"
                  className="btn btn-sm btn-icon btn-active-danger"
                  onClick={() => revokeSession(record)}
                  title={L("Revoke")}
                >
                  <i className="fa fa-ban"></i>
                </button>
              ) : null,
          },
        ]
      : []),
  ];

  return (
    <div>
      <PageHeader
        title={L("ActiveSessions")}
        actions={
          isRevocationEnabled && hasOtherSessions ? (
            <button className="btn btn-danger" onClick={revokeAllOtherSessions}>
              <i className="fa fa-ban me-1"></i>
              {L("RevokeAllOtherSessions")}
            </button>
          ) : undefined
        }
      />
      <div className={containerClass}>
        <div className="card card-custom gutter-b">
          <div className="card-body">
            {loading ? (
              <div className="text-center p-5">
                <i className="fa fa-spinner fa-spin fa-2x"></i>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center p-5 text-muted">
                {L("NoActiveSessions")}
              </div>
            ) : (
              <Table
                dataSource={sessions}
                columns={columns}
                pagination={false}
                loading={loading}
                rowKey={(record) => String(record.id)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveSessionsPage;
