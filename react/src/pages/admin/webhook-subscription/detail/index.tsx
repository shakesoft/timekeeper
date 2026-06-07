import React, { useCallback, useEffect, useState } from "react";
import { Dropdown, Modal, Table, App } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageHeader, {
  type BreadcrumbItem,
} from "../../components/common/PageHeader";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ActivateWebhookSubscriptionInput,
  GetAllSendAttemptsOutput,
  WebhookSendAttemptServiceProxy,
  WebhookSubscriptionServiceProxy,
  WebhookSubscription,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import CreateOrEditWebhookSubscriptionModal from "../components/CreateOrEditWebhookSubscriptionModal";
import { useTheme } from "@/hooks/useTheme";

const useQuery = () => new URLSearchParams(useLocation().search);

const WebhookSubscriptionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const subscriptionId = query.get("id") || "";

  const subscriptionService = useServiceProxy(
    WebhookSubscriptionServiceProxy,
    [],
  );
  const sendAttemptService = useServiceProxy(
    WebhookSendAttemptServiceProxy,
    [],
  );

  const [subscription, setSubscription] = useState<
    WebhookSubscription | undefined
  >();
  const [, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<GetAllSendAttemptsOutput[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [detailModal, setDetailModal] = useState<{
    visible: boolean;
    text: string;
  }>({ visible: false, text: "" });
  const [createVisible, setCreateVisible] = useState(false);
  const [isSecretBlurActive, setIsSecretBlurActive] = useState(true);
  const { containerClass } = useTheme();
  const { modal } = App.useApp();
  const breadcrumbs: BreadcrumbItem[] = [
    {
      text: L("WebhookSubscriptions"),
      route: "/app/admin/webhook-subscriptions",
    },
    { text: L("WebhookSubscriptionDetail") },
  ];

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const s = await subscriptionService.getSubscription(subscriptionId);
      setSubscription(s);
    } finally {
      setLoading(false);
    }
  }, [subscriptionId, subscriptionService]);

  const fetchAttempts = useCallback(async () => {
    setAttemptsLoading(true);
    try {
      const r = await sendAttemptService.getAllSendAttempts(
        subscriptionId,
        10,
        0,
      );
      setAttempts(r.items ?? []);
    } finally {
      setAttemptsLoading(false);
    }
  }, [sendAttemptService, subscriptionId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);
  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  const toggleActivity = () => {
    if (!subscription) return;
    const msg = subscription.isActive
      ? L("DeactivateSubscriptionWarningMessage")
      : L("ActivateSubscriptionWarningMessage");
    modal.confirm({
      title: L("AreYouSure"),
      content: msg,
      onOk: async () => {
        const input = new ActivateWebhookSubscriptionInput();
        input.subscriptionId = subscription.id;
        input.isActive = !subscription.isActive;
        await subscriptionService.activateWebhookSubscription(input);
        const updatedSubscription =
          await subscriptionService.getSubscription(subscriptionId);
        setSubscription(updatedSubscription);
      },
    });
  };

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

  const columns: ColumnsType<GetAllSendAttemptsOutput> = [
    {
      title: L("Actions"),
      key: "actions",
      width: 160,
      render: (_, r) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "resend",
                label: L("Resend"),
                onClick: () => resend(r.id),
              },
              {
                key: "view",
                label: L("ViewWebhookEvent"),
                onClick: () =>
                  navigate(
                    `/app/admin/webhook-event-detail?id=${r.webhookEventId}`,
                  ),
              },
            ],
          }}
          trigger={["click"]}
        >
          <button type="button" className="btn btn-primary btn-sm">
            {L("Actions")}
          </button>
        </Dropdown>
      ),
    },
    { title: L("WebhookEvent"), dataIndex: "webhookName" },
    { title: L("WebhookEventId"), dataIndex: "webhookEventId" },
    {
      title: L("CreationTime"),
      dataIndex: "creationTime",
      render: (v?: string) => (v ? (v.toLocaleString?.() ?? String(v)) : "-"),
    },
    {
      title: L("HttpStatusCode"),
      dataIndex: "responseStatusCode",
      width: 150,
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
    {
      title: L("Data"),
      key: "data",
      render: (_, r) =>
        r.data && r.data.length > 100 ? (
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() =>
              setDetailModal({ visible: true, text: r.data || "" })
            }
          >
            {L("ShowData")}
          </button>
        ) : (
          <span>{r.data}</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={L("WebhookSubscriptions")}
        breadcrumbs={breadcrumbs}
        actions={
          subscription ? (
            <div className="d-flex gap-2">
              {subscription.isActive ? (
                <span className="badge badge-success me-2">{L("Active")}</span>
              ) : (
                <span className="badge badge-dark me-2">{L("Disabled")}</span>
              )}
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "edit",
                      label: L("EditWebhookSubscription"),
                      onClick: () => setCreateVisible(true),
                    },
                    {
                      key: "toggle",
                      label: subscription.isActive ? L("Disable") : L("Enable"),
                      onClick: toggleActivity,
                    },
                  ],
                }}
                trigger={["click"]}
              >
                <button
                  type="button"
                  className="btn btn-primary btn-sm d-inline-flex align-items-center"
                >
                  <i className="fa fa-cog me-2"></i>
                  <span>{L("Actions")}</span>
                </button>
              </Dropdown>
            </div>
          ) : undefined
        }
      />

      <div className={containerClass}>
        <div className="card card-custom gutter-b">
          <div className="card-body">
            {subscription && (
              <div className="mb-6">
                <div className="row mb-3">
                  <div className="col-2 fw-bold">{L("WebhookEndpoint")}</div>
                  <div className="col-10 text-break">
                    {subscription.webhookUri}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-2 fw-bold">{L("WebhookEvents")}</div>
                  <div className="col-10 text-break">
                    {(subscription.webhooks || []).map((w) => (
                      <div key={w}>{w}</div>
                    ))}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-2 fw-bold">
                    {L("AdditionalWebhookHeaders")}
                  </div>
                  <div className="col-10 text-break">
                    {subscription.headers &&
                      Object.keys(subscription.headers).map((k) => (
                        <div key={k}>
                          "{k}" : "{subscription.headers?.[k]}"
                        </div>
                      ))}
                  </div>
                </div>
                <div className="row mb-0">
                  <div className="col-2 fw-bold">{L("WebhookSecret")}</div>
                  <div className="col-10 position-relative">
                    <span
                      style={{
                        filter: isSecretBlurActive ? "blur(5px)" : "none",
                        userSelect: isSecretBlurActive ? "none" : "auto",
                      }}
                    >
                      {subscription.secret}
                    </span>
                    {isSecretBlurActive && (
                      <button
                        type="button"
                        className="btn btn-sm btn-dark btn-elevate btn-elevate-air ms-3"
                        onClick={() => setIsSecretBlurActive(false)}
                      >
                        {L("ViewWebhookSecret")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <h5 className="mb-3">{L("WebhookSendAttempts")}</h5>
            <Table<GetAllSendAttemptsOutput>
              rowKey="id"
              dataSource={attempts}
              columns={columns}
              loading={attemptsLoading}
              pagination={false}
            />
          </div>
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

      <CreateOrEditWebhookSubscriptionModal
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        onSaved={() => {
          setCreateVisible(false);
          fetchDetail();
        }}
        subscriptionId={subscriptionId}
      />
    </div>
  );
};

export default WebhookSubscriptionDetailPage;
