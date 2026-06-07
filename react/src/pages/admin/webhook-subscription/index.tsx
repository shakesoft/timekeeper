import React, { useCallback, useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import PageHeader from "../components/common/PageHeader";
import { usePermissions } from "../../../hooks/usePermissions";
import { useNavigate } from "react-router-dom";
import {
  GetAllSubscriptionsOutput,
  WebhookSubscriptionServiceProxy,
} from "@api/generated/service-proxies";
import CreateOrEditWebhookSubscriptionModal from "./components/CreateOrEditWebhookSubscriptionModal";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useTheme } from "@/hooks/useTheme";

const WebhookSubscriptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isGranted } = usePermissions();
  const service = useServiceProxy(WebhookSubscriptionServiceProxy, []);
  const { containerClass } = useTheme();
  const [records, setRecords] = useState<GetAllSubscriptionsOutput[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await service.getAllSubscriptions();
      setRecords(result.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnsType<GetAllSubscriptionsOutput> = [
    {
      title: "",
      key: "details",
      width: 120,
      render: (_, r) => (
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() =>
            navigate(`/app/admin/webhook-subscriptions-detail?id=${r.id}`)
          }
        >
          {L("Details")}
        </button>
      ),
    },
    { title: L("WebhookEndpoint"), dataIndex: "webhookUri" },
    {
      title: L("WebhookEvents"),
      key: "webhooks",
      render: (_, r) => (
        <div>
          {(r.webhooks || []).map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
      ),
    },
    {
      title: L("IsActive"),
      dataIndex: "isActive",
      render: (v: boolean) =>
        v ? (
          <span className="badge badge-success m-1">{L("Yes")}</span>
        ) : (
          <span className="badge badge-dark m-1">{L("No")}</span>
        ),
      width: 140,
    },
  ];

  return (
    <>
      <PageHeader
        title={L("WebhookSubscriptions")}
        description={L("WebhookSubscriptionsInfo")}
        actions={
          isGranted("Pages.Administration.WebhookSubscription.Create") ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setEditingId(undefined);
                setModalVisible(true);
              }}
            >
              <i className="fa fa-plus btn-md-icon"></i>
              <span className="d-none d-md-inline-block ms-2">
                {L("AddNewWebhookSubscription")}
              </span>
            </button>
          ) : undefined
        }
      />

      <div className={containerClass}>
        <div className="card card-body">
          <div className="col-12 mb-4">
            <div className="alert bg-light-primary d-flex align-items-center p-5 mb-0">
              <span className="me-4">⚠️</span>
              <div className="d-flex flex-column">
                <span>{L("WebhookPageInfo")}</span>
              </div>
            </div>
          </div>
          <Table<GetAllSubscriptionsOutput>
            rowKey="id"
            dataSource={records}
            columns={columns}
            loading={loading}
            pagination={false}
          />
        </div>

        <CreateOrEditWebhookSubscriptionModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSaved={fetchData}
          subscriptionId={editingId}
        />
      </div>
    </>
  );
};

export default WebhookSubscriptionsPage;
