import React, { useState, useEffect, useCallback } from "react";
import { Table, Dropdown, App } from "antd";
import type { MenuProps } from "antd";
import CreateOrEditPropertyModal from "./CreateOrEditDynamicPropertyModal";
import { usePermissions } from "../../../../hooks/usePermissions";
import {
  DynamicPropertyDto,
  DynamicPropertyServiceProxy,
} from "../../../../api/generated/service-proxies";
import PropertyValueModal from "./DynamicPropertyValueModal";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

const PropertiesTab: React.FC = () => {
  const { isGranted } = usePermissions();
  const dynamicPropertyService = useServiceProxy(
    DynamicPropertyServiceProxy,
    [],
  );
  const { modal } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<DynamicPropertyDto[]>([]);

  const [isCreateOrEditModalVisible, setCreateOrEditModalVisible] =
    useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<
    number | undefined
  >();

  const [isValuesModalVisible, setValuesModalVisible] = useState(false);
  const [valuesProperty, setValuesProperty] = useState<
    DynamicPropertyDto | undefined
  >();

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const result = await dynamicPropertyService.getAll();
      setProperties(result.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [dynamicPropertyService]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleDelete = (propertyId: number) => {
    modal.confirm({
      title: L("AreYouSure"),
      content: L("DeleteDynamicPropertyMessage"),
      onOk: async () => {
        await dynamicPropertyService.delete(propertyId);
        await fetchProperties();
      },
    });
  };

  const getMenuItems = (record: DynamicPropertyDto): MenuProps => {
    const items: MenuProps["items"] = [];

    if (isGranted("Pages.Administration.DynamicProperties.Edit")) {
      items.push({
        key: "edit",
        label: L("Edit"),
        onClick: () => {
          setEditingPropertyId(record.id);
          setCreateOrEditModalVisible(true);
        },
      });
    }

    if (isGranted("Pages.Administration.DynamicProperties.Delete")) {
      items.push({
        key: "delete",
        label: L("Delete"),
        onClick: () => handleDelete(record.id!),
        danger: true,
      });
    }

    if (
      record.inputType !== "CHECKBOX" &&
      isGranted("Pages.Administration.DynamicPropertyValue.Edit")
    ) {
      items.push({
        key: "editValues",
        label: L("EditValues"),
        onClick: () => {
          setValuesProperty(record);
          setValuesModalVisible(true);
        },
      });
    }

    return { items };
  };

  const columns = [
    {
      title: L("Actions"),
      width: 130,
      align: "center" as const,
      render: (_text: string, record: DynamicPropertyDto) => (
        <Dropdown menu={getMenuItems(record)} trigger={["click"]}>
          <button
            type="button"
            className="btn btn-primary btn-sm dropdown-toggle d-inline-flex align-items-center"
          >
            <i className="fa fa-cog me-2 align-middle"></i>
            <span className="align-middle">{L("Actions")}</span>
          </button>
        </Dropdown>
      ),
    },
    { title: L("PropertyName"), dataIndex: "propertyName", width: 200 },
    { title: L("DisplayName"), dataIndex: "displayName", width: 200 },
    { title: L("InputType"), dataIndex: "inputType", width: 150 },
    { title: L("Permission"), dataIndex: "permission" },
  ];

  return (
    <div>
      {isGranted("Pages.Administration.DynamicProperties.Create") && (
        <button
          type="button"
          className="btn btn-primary float-end mb-3 d-inline-flex align-items-center"
          onClick={() => {
            setEditingPropertyId(undefined);
            setCreateOrEditModalVisible(true);
          }}
        >
          <i className="fa fa-plus me-2 align-middle"></i>
          <span className="align-middle">{L("AddNewDynamicProperty")}</span>
        </button>
      )}
      <Table
        dataSource={properties}
        columns={columns}
        loading={loading}
        rowKey="id"
        scroll={{ x: 800 }}
      />

      <CreateOrEditPropertyModal
        isVisible={isCreateOrEditModalVisible}
        onClose={() => {
          setCreateOrEditModalVisible(false);
          setEditingPropertyId(undefined);
        }}
        onSave={fetchProperties}
        propertyId={editingPropertyId}
      />
      <PropertyValueModal
        isVisible={isValuesModalVisible}
        onClose={() => setValuesModalVisible(false)}
        propertyId={valuesProperty?.id}
      />
    </div>
  );
};
export default PropertiesTab;
