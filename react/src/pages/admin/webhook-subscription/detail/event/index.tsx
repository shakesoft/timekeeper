import React, { useCallback, useEffect, useState } from "react";
import { App, Modal, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageHeader from "../../../components/common/PageHeader";
import { useLocation } from "react-router-dom";
import {
  GetAllSendAttemptsOfWebhookEventOutput,
  WebhookEvent,
  WebhookEventServiceProxy,
  WebhookSendAttemptServiceProxy,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

const useQuery = () => new URLSearchParams(useLocation().search);

const WebhookEventDetailPage: React.FC = () => {
  const query = useQuery();
  const webhookEventId = query.get("id") || "";
  const { modal } = App.useApp();
  const eventService = useServiceProxy(WebhookEventServiceProxy, []);
  const sendAttemptService = useServiceProxy(
    WebhookSendAttemptServiceProxy,
    [],
  );

  const [webhookEvent, setWebhookEvent] = useState<WebhookEvent | undefined>();
  const [attempts, setAttempts] = useState<
    GetAllSendAttemptsOfWebhookEventOutput[]
  >([]);
  const [, setLoading] = useState(true);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [detailModal, setDetailModal] = useState<{
    visible: boolean;
    text: string;
  }>({ visible: false, text: "" });

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const result = await eventService.get(webhookEventId);
      setWebhookEvent(result);
    } finally {
      setLoading(false);
    }
  }, [eventService, webhookEventId]);

  const fetchAttempts = useCallback(async () => {
    setAttemptsLoading(true);
    try {
      const result =
        await sendAttemptService.getAllSendAttemptsOfWebhookEvent(
          webhookEventId,
        );
      setAttempts(result.items ?? []);
    } finally {
      setAttemptsLoading(false);
    }
  }, [sendAttemptService, webhookEventId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);
  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  const resend = (id: string) => {
    modal.confirm({
      title: L("AreYouSure"),
      content: L("WebhookEventWillBeSendWithSameParameters"),
      onOk: async () => {
        await sendAttemptService.resend(id);
        setTimeout(fetchAttempts, 500);
      },
    });
  };

  const columns: ColumnsType<GetAllSendAttemptsOfWebhookEventOutput> = [
    {
      title: L("Actions"),
      key: "actions",
      width: 160,
      render: (_, r) => (
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => resend(r.id)}
        >
          {L("Resend")}
        </button>
      ),
    },
    {
      title: L("WebhookSubscriptionId"),
      dataIndex: "webhookSubscriptionId",
      width: 320,
    },
    { title: L("WebhookEndpoint"), dataIndex: "webhookUri" },
    {
      title: L("CreationTime"),
      dataIndex: "creationTime",
      width: 180,
      render: (v?: string) => (v ? (v.toLocaleString?.() ?? String(v)) : "-"),
    },
    {
      title: L("HttpStatusCode"),
      dataIndex: "responseStatusCode",
      width: 130,
    },
    {
      title: L("Response"),
      key: "response",
      render: (_, r) =>
        r.response && r.response.length > 100 ? (
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() =>
              setDetailModal({ visible: true, text: r.response || "" })
            }
          >
            {L("ShowResponse")}
          </button>
        ) : (
          <span>{r.response}</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader title={L("WebhookEventDetail")} />

      <div className="card card-custom gutter-b">
        <div className="card-body">
          {webhookEvent && (
            <div className="mb-6">
              <div className="row mb-3">
                <div className="col-2 fw-bold">{L("WebhookEvent")}</div>
                <div className="col-10">{webhookEvent.webhookName}</div>
              </div>
              <div className="row mb-3">
                <div className="col-2 fw-bold">{L("CreationTime")}</div>
                <div className="col-10">
                  {webhookEvent.creationTime?.toLocaleString?.() ??
                    String(webhookEvent.creationTime)}
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-2 fw-bold">{L("Data")}</div>
                <div className="col-10 text-break">
                  {webhookEvent.data && webhookEvent.data.length > 300 ? (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() =>
                        setDetailModal({
                          visible: true,
                          text: webhookEvent.data || "",
                        })
                      }
                    >
                      {L("ShowData")}
                    </button>
                  ) : (
                    <span>{webhookEvent.data}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <h5 className="mb-3">{L("WebhookSendAttempts")}</h5>
          <Table<GetAllSendAttemptsOfWebhookEventOutput>
            rowKey="id"
            dataSource={attempts}
            columns={columns}
            loading={attemptsLoading}
            pagination={false}
          />
        </div>
      </div>

      <Modal
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, text: "" })}
        footer={null}
        width={800}
      >
        <pre style={{ whiteSpace: "pre-wrap" }}>{detailModal.text}</pre>
      </Modal>
    </div>
  );
};

export default WebhookEventDetailPage;
