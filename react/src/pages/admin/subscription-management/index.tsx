import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppConsts from "../../../lib/app-consts";
import {
  InvoiceServiceProxy,
  PaymentServiceProxy,
  SubscriptionServiceProxy,
  TenantRegistrationServiceProxy,
  CreateInvoiceDto,
  StartExtendSubscriptionInput,
  StartUpgradeSubscriptionInput,
  StartTrialToBuySubscriptionInput,
  PaymentPeriodType,
  TenantLoginInfoDto,
  type EditionsSelectOutput,
  type EditionWithFeaturesDto,
  type SubscriptionPaymentListDto,
} from "../../../api/generated/service-proxies";
import { Table, Tabs, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import { useDataTable } from "../../../hooks/useDataTable";
import { useSession } from "../../../hooks/useSession";
import { useTheme } from "../../../hooks/useTheme";
import { useCurrencySign } from "../../../hooks/useCurrencySign";

import ShowDetailModal from "./components/ShowDetailModal";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { formatDate } from "../components/common/timing/lib/datetime-helper";

const SubscriptionManagement: React.FC = () => {
  const invoiceService = useServiceProxy(InvoiceServiceProxy, []);
  const paymentService = useServiceProxy(PaymentServiceProxy, []);
  const subscriptionService = useServiceProxy(SubscriptionServiceProxy, []);
  const tenantRegistrationService = useServiceProxy(
    TenantRegistrationServiceProxy,
    [],
  );

  const navigate = useNavigate();
  const { tenant } = useSession();
  const { containerClass } = useTheme();
  const currencySign = useCurrencySign();

  const [editions, setEditions] = useState<EditionWithFeaturesDto[]>([]);
  const [tenantState, setTenantState] = useState<TenantLoginInfoDto | null>(
    tenant,
  );

  const showDetailModalRef = useRef<{ show: (paymentId: number) => void }>(
    null,
  );

  useEffect(() => {
    tenantRegistrationService
      .getEditionsForSelect()
      .then((res: EditionsSelectOutput) => {
        setEditions(res.editionsWithFeatures ?? []);
      });
  }, [tenantRegistrationService]);

  useEffect(() => {
    setTenantState(tenant);
  }, [tenant]);

  const fetchHistory = useCallback(
    async (skipCount: number, maxResultCount: number, sorting: string) => {
      const result = await paymentService.getPaymentHistory(
        sorting || undefined,
        skipCount,
        maxResultCount,
      );
      return { totalCount: result.totalCount ?? 0, items: result.items ?? [] };
    },
    [paymentService],
  );

  const { records, loading, pagination, handleTableChange, fetchData } =
    useDataTable<SubscriptionPaymentListDto>(fetchHistory);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createOrShowInvoice = useCallback(
    async (paymentId: number, invoiceNo?: string | null) => {
      if (invoiceNo) {
        window.open(`/app/admin/invoice/${paymentId}`, "_blank");
        return;
      }
      await invoiceService.createInvoice(
        new CreateInvoiceDto({ subscriptionPaymentId: paymentId }),
      );
      fetchData();
      window.open(`/app/admin/invoice/${paymentId}`, "_blank");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invoiceService],
  );

  const disableRecurringPayments = useCallback(async () => {
    await subscriptionService.disableRecurringPayments();
    setTenantState((prev) => {
      if (!prev) return prev;
      const updated = Object.assign(new TenantLoginInfoDto(), prev);
      updated.subscriptionPaymentType = 2;
      return updated;
    });
  }, [subscriptionService]);

  const enableRecurringPayments = useCallback(async () => {
    await subscriptionService.enableRecurringPayments();
    setTenantState((prev) => {
      if (!prev) return prev;
      const updated = Object.assign(new TenantLoginInfoDto(), prev);
      updated.subscriptionPaymentType = 1;
      return updated;
    });
  }, [subscriptionService]);

  const hasRecurringSubscription = useCallback(() => {
    return tenantState?.subscriptionPaymentType !== 0;
  }, [tenantState]);

  const startUpdateSubscription = useCallback(
    async (editionId: number, paymentPeriod?: "Monthly" | "Annual") => {
      const input = new StartUpgradeSubscriptionInput({
        targetEditionId: editionId,
        paymentPeriodType: paymentPeriod
          ? PaymentPeriodType[paymentPeriod]
          : PaymentPeriodType.Monthly,
        successUrl: AppConsts.appBaseUrl + "/account/upgrade-succeed",
        errorUrl: AppConsts.appBaseUrl + "/account/payment-failed",
      });
      const result = await subscriptionService.startUpgradeSubscription(input);
      if (result.upgraded) {
        abp.message.success(L("YourAccountIsUpgraded"));
      } else {
        navigate("/account/gateway-selection?paymentId=" + result.paymentId);
      }
    },
    [navigate, subscriptionService],
  );

  const startExtendSubscription = useCallback(async () => {
    const input = new StartExtendSubscriptionInput({
      successUrl: AppConsts.appBaseUrl + "/account/extend-succeed",
      errorUrl: AppConsts.appBaseUrl + "/account/payment-failed",
    });
    const paymentId = await subscriptionService.startExtendSubscription(input);
    navigate("/account/gateway-selection?paymentId=" + paymentId);
  }, [navigate, subscriptionService]);

  const startBuySubscription = useCallback(
    async (paymentPeriod?: "Monthly" | "Annual") => {
      const input = new StartTrialToBuySubscriptionInput({
        paymentPeriodType: paymentPeriod
          ? PaymentPeriodType[paymentPeriod]
          : PaymentPeriodType.Monthly,
        successUrl: AppConsts.appBaseUrl + "/account/buy-succeed",
        errorUrl: AppConsts.appBaseUrl + "/account/payment-failed",
      });
      const paymentId =
        await subscriptionService.startTrialToBuySubscription(input);
      navigate("/account/gateway-selection?paymentId=" + paymentId);
    },
    [navigate, subscriptionService],
  );

  const getMenuItems = (
    record: SubscriptionPaymentListDto,
  ): MenuProps["items"] => {
    return [
      {
        key: "detail",
        label: L("Detail"),
        onClick: () => showDetailModalRef.current?.show(record.id),
      },
      {
        key: "invoice",
        label: L("ShowInvoice"),
        onClick: () => createOrShowInvoice(record.id, record.invoiceNo),
      },
    ];
  };

  const columns: ColumnsType<SubscriptionPaymentListDto> = [
    {
      title: L("Actions"),
      key: "actions",
      width: 130,
      align: "center" as const,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getMenuItems(record) }}
          trigger={["click"]}
          placement="bottomLeft"
        >
          <button
            type="button"
            className="btn btn-primary btn-sm dropdown-toggle d-inline-flex align-items-center"
          >
            <i className="fa fa-cog me-1"></i>
            {L("Actions")}
          </button>
        </Dropdown>
      ),
    },
    {
      title: L("ProcessTime"),
      dataIndex: "creationTime",
      width: 170,
      render: (dt?: string) =>
        dt
          ? (formatDate(dt, AppConsts.timing.longDateFormat) ?? String(dt))
          : "-",
      sorter: true,
    },
    { title: L("Gateway"), dataIndex: "gateway", width: 130, sorter: true },
    {
      title: L("Amount"),
      dataIndex: "totalAmount",
      width: 120,
      render: (v: number) => (
        <span>
          {currencySign} {Number(v || 0).toFixed(2)}
        </span>
      ),
      sorter: true,
    },
    { title: L("Status"), dataIndex: "status", width: 140, sorter: true },
    {
      title: L("Period"),
      dataIndex: "paymentPeriodType",
      width: 140,
      sorter: true,
    },
    { title: L("DayCount"), dataIndex: "dayCount", width: 110 },
    { title: L("PaymentId"), dataIndex: "externalPaymentId", width: 220 },
    { title: L("InvoiceNo"), dataIndex: "invoiceNo", width: 140, sorter: true },
  ];

  const tabItems = [
    {
      key: "1",
      label: "Subscription Information",
      children: (
        <div className="row">
          <div className="col-lg-12">
            <h3 className="mb-10">{L("YourPlan")}</h3>
            {!!tenantState?.edition && (
              <div className="card shadow-sm col-md-6 col-lg-4">
                <div className="card-header">
                  <div className="container">
                    <div className="row">
                      <div className="col-md-12 mt-10">
                        <small className="text-muted text-uppercase d-block">
                          {L("Edition")}
                        </small>
                        <h3 className="d-inline">
                          {tenantState?.edition?.displayName}
                        </h3>
                        {tenantState?.edition?.isFree && (
                          <span className="badge bg-success ms-2">
                            {L("Free")}
                          </span>
                        )}
                        {tenantState?.isInTrialPeriod && (
                          <span className="badge bg-warning ms-2">
                            {L("Trial")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="row my-5">
                      <div className="col-md-6">
                        <small className="text-muted text-uppercase d-block">
                          {L("SubscriptionStartDate")}
                        </small>
                        <h3 className="d-inline">
                          {tenantState?.creationTimeString}
                        </h3>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted text-uppercase d-block">
                          {L("SubscriptionEndDate")}
                        </small>
                        <h3 className="d-inline">
                          {tenantState?.subscriptionDateString}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  <small className="text-muted text-uppercase d-block mb-5">
                    {L("WhatsIncludedInYourPlan")}
                  </small>
                  {tenantState?.featureValues?.length ? (
                    <div>
                      {(tenantState?.featureValues || []).map((feature) => (
                        <span
                          key={feature.name}
                          className={`text-left d-block mb-2 ${
                            feature.value === "false"
                              ? "text-muted"
                              : "text-success"
                          }`}
                        >
                          {feature.value === "false" ? (
                            <i className="far fa-times-circle text-muted" />
                          ) : (
                            <i className="far fa-check-circle text-success" />
                          )}
                          &nbsp;{feature.name}
                          {feature.value !== "false" &&
                            feature.value !== "true" && (
                              <span>: {feature.value}</span>
                            )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>{L("NoFeaturesInYourPlan")}</p>
                  )}
                </div>

                <div className="card-footer">
                  {tenantState.subscriptionPaymentType === 1 && (
                    <div className="mb-3">
                      <button
                        className="btn btn-secondary btn-lg w-100"
                        onClick={disableRecurringPayments}
                      >
                        {L("DisableRecurringPayments")}
                      </button>
                    </div>
                  )}
                  {tenantState.subscriptionPaymentType === 2 && (
                    <div className="mb-3">
                      <button
                        className="btn btn-info btn-lg w-100"
                        onClick={enableRecurringPayments}
                      >
                        {L("EnableRecurringPayments")}
                      </button>
                    </div>
                  )}

                  {!hasRecurringSubscription() &&
                    tenantState?.edition &&
                    !tenantState?.edition.isFree &&
                    !tenantState?.isInTrialPeriod && (
                      <div className="mb-3">
                        <button
                          className="btn btn-info btn-lg w-100"
                          onClick={startExtendSubscription}
                        >
                          {L("Extend")}
                        </button>
                      </div>
                    )}

                  {!!tenantState?.isInTrialPeriod && (
                    <div className="mb-3">
                      <div className="btn-group w-100">
                        <button
                          className="btn btn-info btn-lg w-100 dropdown-toggle"
                          data-bs-toggle="dropdown"
                        >
                          {L("BuyNow")}
                        </button>
                        <ul className="dropdown-menu w-100">
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => startBuySubscription("Monthly")}
                            >
                              {L("Monthly")}
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => startBuySubscription("Annual")}
                            >
                              {L("Annual")}
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {tenantState?.edition &&
                    !tenantState?.edition?.isHighestEdition &&
                    !tenantState?.isInTrialPeriod && (
                      <div className="mb-3">
                        {!tenantState?.edition?.isFree ? (
                          <div>
                            {(editions || []).map((edition) => (
                              <div className="mb-3" key={edition.edition?.id}>
                                <button
                                  className="btn btn-warning btn-lg w-100"
                                  onClick={() =>
                                    startUpdateSubscription(edition.edition.id!)
                                  }
                                >
                                  {L("UpgradeTo", edition.edition?.displayName)}
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div>
                            {(editions || []).map((edition) => (
                              <div className="mb-3" key={edition.edition?.id}>
                                <div className="btn-group w-100">
                                  <button
                                    className="btn btn-warning btn-lg w-100 dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                  >
                                    {L(
                                      "UpgradeTo",
                                      edition.edition?.displayName,
                                    )}
                                  </button>
                                  <ul className="dropdown-menu">
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() =>
                                          startUpdateSubscription(
                                            edition.edition.id!,
                                            "Monthly",
                                          )
                                        }
                                      >
                                        {L("Monthly")}
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() =>
                                          startUpdateSubscription(
                                            edition.edition.id!,
                                            "Annual",
                                          )
                                        }
                                      >
                                        {L("Annual")}
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Payment History",
      children: (
        <div className="table-responsive">
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={records}
            pagination={pagination}
            onChange={(pag, _filters, sorter) => handleTableChange(pag, sorter)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="post d-flex flex-column-fluid py-10" id="kt_post">
      <div id="kt_content_container" className={containerClass}>
        <div className="card">
          <div className="card-body p-lg-6">
            <Tabs defaultActiveKey="1" items={tabItems} />

            <ShowDetailModal ref={showDetailModalRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
