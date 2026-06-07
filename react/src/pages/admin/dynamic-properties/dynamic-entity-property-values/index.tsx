import React, { useRef } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import DynamicPropertyValueManager, {
  type DynamicPropertyValueManagerRef,
} from "./components/DynamicPropertyValueManager";
import L from "@/lib/L";

const DynamicEntityPropertyValuePage: React.FC = () => {
  const params = useParams<{ entityFullName: string; rowId: string }>();
  const managerRef = useRef<DynamicPropertyValueManagerRef>(null);

  const saveAll = () => {
    managerRef.current?.saveAll();
  };

  return (
    <div>
      <PageHeader
        title={L("DynamicEntityPropertyValues")}
        description={`${L("EntityFullName")}: ${params.entityFullName} - ${L(
          "EntityRowId",
        )}: ${params.rowId}`}
      />
      <div className="card">
        <div className="card-body">
          {params.entityFullName && params.rowId && (
            <DynamicPropertyValueManager
              ref={managerRef}
              entityFullName={params.entityFullName}
              entityId={params.rowId}
            />
          )}
        </div>
        <div className="card-footer text-end">
          <button
            key="save"
            type="submit"
            className="btn btn-primary fw-bold d-inline-flex align-items-center"
            onClick={saveAll}
          >
            <i className="fa fa-save align-middle me-2"></i>
            <span className="align-middle">{L("Save")}</span>
          </button>
          ,
        </div>
      </div>
    </div>
  );
};

export default DynamicEntityPropertyValuePage;
