import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  InvoiceDto,
  InvoiceServiceProxy,
} from "../../../../api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import AppConsts from "@/lib/app-consts";
import L from "@/lib/L";
import { useCurrencySign } from "@/hooks/useCurrencySign";
import { formatDate } from "../../components/common/timing/lib/datetime-helper";

const InvoicePage: React.FC = () => {
  const invoiceService = useServiceProxy(InvoiceServiceProxy, []);
  const { paymentId } = useParams();
  const [invoiceInfo, setInvoiceInfo] = useState<InvoiceDto | null>(null);
  const currencySign = useCurrencySign();

  useEffect(() => {
    const id = Number(paymentId);
    if (!isNaN(id)) {
      invoiceService.getInvoiceInfo(id).then(setInvoiceInfo);
    }
  }, [paymentId, invoiceService]);

  const logoSkin =
    document.documentElement.getAttribute("data-bs-theme") === "dark"
      ? "dark"
      : "light";
  const companyLogo = `${AppConsts.appBaseUrl}/assets/common/images/app-logo-on-${logoSkin}.svg`;

  return (
    <div className="post d-flex flex-column-fluid py-10" id="kt_post">
      <div id="kt_content_container" className="container-xxl">
        <div className="card">
          <div className="card-body p-lg-20">
            <div className="d-flex flex-column flex-xl-row">
              <div className="flex-lg-row-fluid me-xl-18 mb-10 mb-xl-0">
                <div className="mt-n1">
                  <div className="d-flex flex-stack pb-10">
                    <a href="#">
                      <img alt="Logo" src={companyLogo} className="w-150px" />
                    </a>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => window.print()}
                    >
                      {L("Print")}
                    </button>
                  </div>
                  <div className="m-0">
                    <div className="fw-bolder fs-3 text-gray-800 mb-8">
                      {L("Invoice")} #{invoiceInfo?.invoiceNo}
                    </div>
                    <div className="row g-5 mb-11">
                      <div className="col-sm-6">
                        <div className="fw-bold fs-7 text-gray-600 mb-1">
                          {L("Date")}
                        </div>
                        <div className="fw-bolder fs-6 text-gray-800">
                          {formatDate(
                            invoiceInfo?.invoiceDate,
                            AppConsts.timing.shortDateFormat,
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="row g-5 mb-12">
                      <div className="col-sm-6">
                        <div className="fw-bold fs-7 text-gray-600 mb-1">
                          {L("IssueFor")}
                        </div>
                        <div className="fw-bolder fs-6 text-gray-800">
                          {invoiceInfo?.tenantLegalName}
                        </div>
                        <div className="fw-bold fs-7 text-gray-600">
                          {invoiceInfo?.tenantAddress?.map((a, idx) => (
                            <span key={idx}>
                              {a}
                              <br />
                            </span>
                          ))}
                          {L("TaxVatNo")} {invoiceInfo?.tenantTaxNo}
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="fw-bold fs-7 text-gray-600 mb-1">
                          {L("IssuedBy")}
                        </div>
                        <div className="fw-bolder fs-6 text-gray-800">
                          {invoiceInfo?.hostLegalName}
                        </div>
                        <div className="fw-bold fs-7 text-gray-600">
                          {invoiceInfo?.hostAddress?.map((a, idx) => (
                            <span key={idx}>
                              <br />
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <div className="table-responsive border-bottom mb-9">
                        <table className="table mb-3">
                          <thead>
                            <tr className="border-bottom fs-6 fw-bolder text-muted">
                              <th className="min-w-50px pb-2">#</th>
                              <th className="min-w-200px text-start pb-2">
                                {L("Item")}
                              </th>
                              <th className="min-w-50px pb-2">{L("Amount")}</th>
                              <th className="min-w-200px text-end pb-2">
                                {L("TotalAmount")}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoiceInfo?.items?.map((product) => (
                              <tr
                                className="fw-bolder text-gray-700 fs-5"
                                key={product.id}
                              >
                                <td className="d-flex align-items-center pt-6">
                                  {product.count}
                                </td>
                                <td className="pt-6 text-start">
                                  {product.description}
                                </td>
                                <td className="pt-6 text-start">
                                  {currencySign}
                                  {product.amount?.toFixed?.(2)}
                                </td>
                                <td className="pt-6 text-end">
                                  {currencySign}
                                  {Number(
                                    (product.amount || 0) *
                                      (product.count || 0),
                                  ).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="d-flex justify-content-end">
                        <div className="mw-300px">
                          <div className="d-flex flex-stack">
                            <div className="fw-bold pe-10 text-gray-600 fs-7">
                              {L("Total")}
                            </div>
                            <div className="text-end fw-bolder fs-6 text-gray-800">
                              {currencySign}{" "}
                              {invoiceInfo?.totalAmount?.toFixed?.(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
