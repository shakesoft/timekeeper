import React, { useState, useEffect, useCallback } from "react";
import { Modal, Table, Tooltip, App } from "antd";
import {
  DynamicEntityPropertyServiceProxy,
  DynamicEntityPropertyDto,
} from "@api/generated/service-proxies";
import { usePermissions } from "@hooks/usePermissions";
import CreateEntityPropertyModal from "./CreateDynamicEntityPropertyModal";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  entityFullName?: string;
}

const ManageEntityPropertyModal: React.FC<Props> = ({
  isVisible,
  onClose,
  entityFullName,
}) => {
  const { isGranted } = usePermissions();
  const dynamicEntityPropertyService = useServiceProxy(
    DynamicEntityPropertyServiceProxy,
    [],
  );
  const { modal } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<DynamicEntityPropertyDto[]>([]);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);

  const fetchProperties = useCallback(async () => {
    if (!entityFullName) return;
    setLoading(true);
    try {
      const result =
        await dynamicEntityPropertyService.getAllPropertiesOfAnEntity(
          entityFullName,
        );
      setProperties(result.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [entityFullName, dynamicEntityPropertyService]);

  useEffect(() => {
    if (isVisible) {
      fetchProperties();
    }
  }, [isVisible, fetchProperties]);

  const handleDelete = (id: number) => {
    modal.confirm({
      title: L("AreYouSure"),
      content: L("DeleteDynamicPropertyMessage"),
      onOk: async () => {
        await dynamicEntityPropertyService.delete(id);
        fetchProperties();
      },
    });
  };

  const columns = [
    { title: L("DynamicProperty"), dataIndex: "dynamicPropertyName" },
    {
      title: L("Actions"),
      width: 100,
      render: (_text: string, record: DynamicEntityPropertyDto) =>
        isGranted("Pages.Administration.DynamicEntityProperties.Delete") && (
          <Tooltip title={L("Delete")}>
            <button
              type="button"
              className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
              onClick={() => handleDelete(record.id!)}
            >
              <i className="fa fa-trash"></i>
            </button>
          </Tooltip>
        ),
    },
  ];

  return (
    <>
      <Modal
        title={L("DynamicPropertyManagement")}
        open={isVisible}
        onCancel={onClose}
        footer={
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {L("Close")}
          </button>
        }
        width={800}
      >
        {isGranted("Pages.Administration.DynamicEntityProperties.Create") && (
          <button
            type="button"
            className="btn btn-primary float-end mb-5 d-inline-flex align-items-center"
            onClick={() => setCreateModalVisible(true)}
          >
            <i className="fa fa-plus me-2 align-middle"></i>
            <span className="align-middle">
              {L("AddNewDynamicEntityProperty")}
            </span>
          </button>
        )}
        <Table
          dataSource={properties}
          columns={columns}
          loading={loading}
          rowKey="id"
          size="small"
        />
      </Modal>

      <CreateEntityPropertyModal
        isVisible={isCreateModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSave={fetchProperties}
        entityFullName={entityFullName}
      />
    </>
  );
};
export default ManageEntityPropertyModal;
