import React, { useMemo } from "react";
import { Modal } from "antd";
import {
  formatDate,
  fromNow,
} from "../../components/common/timing/lib/datetime-helper";
import { AuditLogListDto } from "@/api/generated/service-proxies";
import L from "@/lib/L";
import AppConsts from "@/lib/app-consts";

interface AuditLogDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  record: AuditLogListDto | null;
}

const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({
  isVisible,
  onClose,
  record,
}) => {
  const formattedParameters = useMemo(() => {
    if (!record?.parameters) {
      return "";
    }
    try {
      const json = JSON.parse(record.parameters);
      return JSON.stringify(json, null, 2);
    } catch {
      return record.parameters;
    }
  }, [record]);

  return (
    <Modal
      title={L("AuditLogDetail")}
      open={isVisible}
      onCancel={onClose}
      footer={null}
      style={{ top: 24 }}
      width={800}
    >
      {record && (
        <div>
          <h3>{L("UserInformations")}</h3>
          <div className="row">
            <div className="col-md-12">
              <div className="mb-5 row">
                <label className="col-lg-3 col-form-label">
                  {L("UserName")}:
                </label>
                <div className="col-lg-9 col-form-label">
                  <span>{record.userName}</span>
                </div>
              </div>
              <div className="mb-5 row">
                <label className="col-lg-3 col-form-label">
                  {L("IpAddress")}:
                </label>
                <div className="col-lg-9 col-form-label">
                  <span>{record.clientIpAddress}</span>
                </div>
              </div>
              <div className="mb-5 row">
                <label className="col-lg-3 col-form-label">
                  {L("Client")}:
                </label>
                <div className="col-lg-9 col-form-label">
                  <span>{record.clientName}</span>
                </div>
              </div>
              <div className="mb-5 row">
                <label className="col-lg-3 col-form-label">
                  {L("Browser")}:
                </label>
                <div className="col-lg-9 col-form-label">
                  <span>{record.browserInfo}</span>
                </div>
              </div>
              {record.impersonatorUserId && (
                <div className="mb-5 row">
                  <label className="col-lg-3 col-form-label"></label>
                  <div className="col-lg-9 text-warning col-form-label">
                    <span>{L("AuditLogImpersonatedOperationInfo")}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <h3>{L("ActionInformations")}</h3>
          <div className="row">
            <div className="col-md-12">
              <div className="mb-5 row">
                <label className="col-lg-3 col-form-label">
                  {L("Service")}:
                </label>
                <div className="col-lg-9 col-form-label">
                  <span>{record.serviceName}</span>
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-5 row">
                <label className="col-lg-3 col-form-label">
                  {L("Action")}:
                </label>
                <div className="col-lg-9 col-form-label">
                  <span>{record.methodName}</span>
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-5 row">
                <label className="col-lg-3 col-form-label">{L("Time")}:</label>
                <div className="col-lg-9 col-form-label">
                  <span>
                    {fromNow(record.executionTime)} (
                    {formatDate(
                      record.executionTime,
                      AppConsts.timing.longDateFormat,
                    )}
                    )
                  </span>
                </div>
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-5 row">
                <label className="col-lg-3 col-form-label">
                  {L("Duration")}:
                </label>
                <div className="col-lg-9 col-form-label">
                  <span>{L("Xms", record.executionDuration)}</span>
                </div>
              </div>
              <div className="mb-5 row">
                <label className="col-lg-3 col-form-label">
                  {L("Parameters")}:
                </label>
                <div className="col-lg-9 col-form-label">
                  <pre lang="js" className="form-control form-control-solid">
                    {formattedParameters}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <h3>{L("CustomData")}</h3>
          <div className="row">
            <div className="col-md-12">
              <div className="mb-5 row">
                <label className="col-lg-3 col-form-label">{L("None")}:</label>
                {record.customData && (
                  <div className="col-lg-9 col-form-label">
                    <pre className="form-control form-control-solid">
                      {record.customData}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          <h3>{L("ErrorState")}</h3>
          <div className="row">
            <div className="col-md-12">
              <div className="mb-5 row">
                {!record.exception ? (
                  <label className="col-lg-12 col-form-label">
                    <i className="fa fa-check-circle text-success"></i>{" "}
                    {L("Success")}
                  </label>
                ) : (
                  <div className="col-lg-12">
                    <pre className="form-control form-control-solid">
                      {record.exception}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AuditLogDetailModal;
