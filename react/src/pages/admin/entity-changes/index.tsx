import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  EntityChangeServiceProxy,
  type EntityAndPropertyChangeListDto,
} from "@api/generated/service-proxies";
import { formatDate } from "../components/common/timing/lib/datetime-helper";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useTheme } from "@/hooks/useTheme";
import { setLoading } from "@/app/slices/authSlice";
import AppConsts from "@/lib/app-consts";

const EntityChangesPage: React.FC = () => {
  const { entityTypeFullName, entityId } = useParams<{
    entityTypeFullName: string;
    entityId: string;
  }>();
  const entityChangeService = useServiceProxy(EntityChangeServiceProxy, []);
  const { containerClass } = useTheme();
  const [changes, setChanges] = useState<EntityAndPropertyChangeListDto[]>([]);

  useEffect(() => {
    if (entityTypeFullName && entityId) {
      setLoading(true);
      entityChangeService
        .getEntityChangesByEntity(entityTypeFullName, entityId)
        .then((data) => {
          setChanges(data.items ?? []);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [entityTypeFullName, entityId, entityChangeService]);

  const entityTypeShortName = entityTypeFullName?.split(".").pop();

  return (
    <div className={containerClass}>
      <style>{`
        .timeline-label .timeline-label{ width: 90px; }
        .timeline-label:before{ left: 122px; }
        .timeline-label .timeline-badge{ width: 6rem; }
        .change-indicator { color: #50cd89; }
        .original-value,
        .new-value,
        .change-indicator { font-weight: bold; }
      `}</style>
      <div className="row">
        <div className="col-xl-12">
          <div className="card card-xl-stretch mb-xl-8">
            <div className="card-header align-items-center border-0 mt-4">
              <h3 className="card-title align-items-start flex-column">
                {(!changes || changes.length === 0) && (
                  <span className="fw-bold mb-2 text-gray-900">
                    {L("NoEntityChanges")}
                  </span>
                )}
                {changes && changes.length > 0 && (
                  <>
                    <span className="fw-bold mb-2 text-gray-900">
                      {L("ChangeLogs")}: {entityTypeShortName} #{entityId}
                    </span>
                    <span className="text-muted fw-semibold fs-7">
                      {changes.length} {L("Changes")}
                    </span>
                  </>
                )}
              </h3>
            </div>
            <div className="card-body pt-5">
              <div className="timeline-label">
                {changes.map((changeItem) => {
                  const c = changeItem.entityChange!;
                  const colorClass =
                    c.changeTypeName === "Created"
                      ? "text-success fs-1"
                      : c.changeTypeName === "Updated"
                        ? "text-warning fs-1"
                        : c.changeTypeName === "Deleted"
                          ? "text-danger fs-1"
                          : "text-muted fs-1";
                  return (
                    <div className="timeline-item" key={c.id}>
                      <div className="timeline-label fw-bold text-gray-800 fs-6 text-end pe-2">
                        {formatDate(
                          c.changeTime,
                          AppConsts.timing.shortDateFormat,
                        )}
                        <br />
                        {formatDate(
                          c.changeTime!,
                          AppConsts.timing.shortTimeFormat,
                        )}
                      </div>
                      <div className="timeline-badge">
                        <i className={`fa fa-genderless ${colorClass}`}></i>
                      </div>
                      <div className="fw-normal timeline-content text-muted ps-3">
                        <span className="fw-bold text-gray-900 ps-3">
                          {c.changeTypeName} {L("by")} {c.userName}
                          {c.impersonatorUserName && (
                            <span className="text-muted">
                              {" "}
                              (
                              {L("ImpersonatedBy", {
                                0: c.impersonatorUserName,
                              })}
                              )
                            </span>
                          )}
                        </span>
                        {changeItem.entityPropertyChanges && (
                          <div className="ps-3 mt-2">
                            <ul className="list-unstyled">
                              {changeItem.entityPropertyChanges.map((pc) => (
                                <li
                                  className="mb-2"
                                  key={`${c.id}-${pc.propertyName}`}
                                >
                                  <strong>{pc.propertyName}</strong>:{" "}
                                  <span className="original-value text-gray-900">
                                    {pc.originalValue}
                                  </span>{" "}
                                  <span className="change-indicator">
                                    -&gt;
                                  </span>{" "}
                                  <span className="new-value text-gray-900">
                                    {pc.newValue}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityChangesPage;
