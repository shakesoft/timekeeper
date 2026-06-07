import React, { useState, useEffect, useCallback } from "react";
import { Table } from "antd";
import { usePermissions } from "@hooks/usePermissions";
import {
  DynamicEntityPropertyServiceProxy,
  GetAllEntitiesHasDynamicPropertyOutput,
} from "@api/generated/service-proxies";
import SelectAnEntityModal from "../../components/SelectEntityModal";
import ManageEntityPropertyModal from "./ManageDynamicEntityPropertyModal";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

const EntityPropertiesTab: React.FC = () => {
  const { isGranted } = usePermissions();
  const dynamicEntityPropertyService = useServiceProxy(
    DynamicEntityPropertyServiceProxy,
    [],
  );

  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<
    GetAllEntitiesHasDynamicPropertyOutput[]
  >([]);

  const [isSelectEntityModalVisible, setSelectEntityModalVisible] =
    useState(false);
  const [isManageModalVisible, setManageModalVisible] = useState(false);
  const [managingEntity, setManagingEntity] = useState<string | undefined>();

  const fetchEntities = useCallback(async () => {
    setLoading(true);
    try {
      const result =
        await dynamicEntityPropertyService.getAllEntitiesHasDynamicProperty();
      setRecords(result.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [dynamicEntityPropertyService]);

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  const handleSelectEntitySave = (entityFullName: string) => {
    setManagingEntity(entityFullName);
    setManageModalVisible(true);
  };

  const handleManageModalClose = () => {
    setManageModalVisible(false);
    fetchEntities();
  };

  const columns = [
    {
      title: L("Actions"),
      width: 120,
      render: (_text: string, record: GetAllEntitiesHasDynamicPropertyOutput) =>
        isGranted("Pages.Administration.DynamicEntityProperties.Edit") && (
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => {
              setManagingEntity(record.entityFullName);
              setManageModalVisible(true);
            }}
          >
            {L("Detail")}
          </button>
        ),
    },
    { title: L("EntityFullName"), dataIndex: "entityFullName" },
  ];

  return (
    <div>
      {isGranted("Pages.Administration.DynamicEntityProperties.Create") && (
        <button
          type="button"
          className="btn btn-primary float-end mb-3 d-inline-flex align-items-center"
          onClick={() => setSelectEntityModalVisible(true)}
        >
          <i className="fa fa-plus me-2 align-middle"></i>
          <span className="align-middle">
            {L("AddNewDynamicEntityProperty")}
          </span>
        </button>
      )}
      <Table
        dataSource={records}
        columns={columns}
        loading={loading}
        rowKey="entityFullName"
      />

      <SelectAnEntityModal
        isVisible={isSelectEntityModalVisible}
        onClose={() => setSelectEntityModalVisible(false)}
        onSave={handleSelectEntitySave}
      />

      <ManageEntityPropertyModal
        isVisible={isManageModalVisible}
        onClose={handleManageModalClose}
        entityFullName={managingEntity}
      />
    </div>
  );
};

export default EntityPropertiesTab;
