import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import {
  AuditLogServiceProxy,
  EntityChangeListDto,
  EntityPropertyChangeDto,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { formatDate, fromISODateString } from "../timing/lib/datetime-helper";
import AppConsts from "@/lib/app-consts";

interface Props {
  open: boolean;
  onClose: () => void;
  entityChange?: EntityChangeListDto;
}

const EntityChangeDetailModal: React.FC<Props> = ({
  open,
  onClose,
  entityChange,
}) => {
  const auditLogService = useServiceProxy(AuditLogServiceProxy, []);

  const [loading, setLoading] = useState<boolean>(false);
  const [propertyChanges, setPropertyChanges] = useState<
    EntityPropertyChangeDto[]
  >([]);

  useEffect(() => {
    if (!open || !entityChange?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPropertyChanges([]);
      return;
    }
    setLoading(true);
    auditLogService
      .getEntityPropertyChanges(entityChange.id)
      .then((result) => setPropertyChanges(result ?? []))
      .finally(() => setLoading(false));
  }, [open, entityChange?.id, auditLogService]);

  const isDate = (
    value: string | undefined,
    propertyTypeFullName: string | undefined,
  ): boolean => {
    if (!value || !propertyTypeFullName) return false;
    return (
      propertyTypeFullName.includes("DateTime") &&
      !Number.isNaN(Date.parse(value).valueOf())
    );
  };

  const getPropertyChangeValue = (
    rawValue?: string,
    propertyTypeFullName?: string,
  ) => {
    if (!rawValue) return rawValue ?? "";
    const value = rawValue.replace(/^['"]+/g, "").replace(/['"]+$/g, "");
    if (value === "null") return "";
    if (isDate(value, propertyTypeFullName)) {
      const dt = fromISODateString(value);
      return dt.isValid()
        ? formatDate(dt, AppConsts.timing.longDateFormat)
        : value;
    }
    return value;
  };

  const title = (
    <div>
      <div>
        {L("Detail")} - {L(`${entityChange?.entityTypeFullName}`)}
      </div>
      {entityChange && (
        <small>
          <span
            dangerouslySetInnerHTML={{
              __html: L("CreatedAtByUser", {
                0: entityChange.changeTime
                  ? formatDate(
                      entityChange.changeTime,
                      AppConsts.timing.shortDateFormat,
                    )
                  : "",
                1: entityChange.userName ?? "",
              }),
            }}
          />
          {entityChange.impersonatorUserName && (
            <span className="text-muted">
              {" "}
              ({L("ImpersonatedBy", entityChange.impersonatorUserName)})
            </span>
          )}
        </small>
      )}
    </div>
  );

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      style={{ top: 24 }}
      width={900}
      footer={[
        <button
          key="cancel"
          type="button"
          className="btn btn-light-primary fw-bold"
          onClick={onClose}
        >
          {L("Cancel")}
        </button>,
      ]}
    >
      <div className="modal-body p-0">
        {propertyChanges.map((pc) => (
          <div key={pc.id} className="card card-custom gutter-b mb-5">
            <div className="card-header py-5">
              <h3 className="card-title">
                <span className="card-label">{pc.propertyName}</span>
              </h3>
            </div>
            <div className="card-body py-0">
              <div className="row m-0">
                <div className="col px-8 py-6 me-8">
                  <div className="fs-sm text-muted fw-bold">
                    {L("OriginalValue")}
                  </div>
                  <div className="fw-bolder">
                    {getPropertyChangeValue(
                      pc.originalValue,
                      pc.propertyTypeFullName,
                    )}
                  </div>
                </div>
                <div className="col px-8 py-6">
                  <div className="fs-sm text-muted fw-bold">
                    {L("NewValue")}
                  </div>
                  <div className="fw-bolder">
                    {getPropertyChangeValue(
                      pc.newValue,
                      pc.propertyTypeFullName,
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!loading && propertyChanges.length === 0 && (
          <div className="primeng-no-data">{L("NoData")}</div>
        )}
      </div>
    </Modal>
  );
};

export default EntityChangeDetailModal;
