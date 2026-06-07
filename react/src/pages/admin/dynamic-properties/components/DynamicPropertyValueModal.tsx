import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Table, Form, Row, Col } from "antd";
import {
  DynamicPropertyValueDto,
  DynamicPropertyValueServiceProxy,
} from "../../../../api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  propertyId?: number;
}

const PropertyValueModal: React.FC<Props> = ({
  isVisible,
  onClose,
  propertyId,
}) => {
  const [form] = Form.useForm();
  const dynamicPropertyValueService = useServiceProxy(
    DynamicPropertyValueServiceProxy,
    [],
  );

  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState<DynamicPropertyValueDto[]>([]);
  const [editingValue, setEditingValue] =
    useState<DynamicPropertyValueDto | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const delayedFocus = useDelayedFocus();

  const fetchValues = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const result =
        await dynamicPropertyValueService.getAllValuesOfDynamicProperty(
          propertyId,
        );
      setValues(result.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [propertyId, dynamicPropertyValueService]);

  useEffect(() => {
    if (isVisible) {
      fetchValues();
    }
  }, [isVisible, fetchValues]);

  const handleDelete = async (valueId: number) => {
    await dynamicPropertyValueService.delete(valueId);
    fetchValues();
    abp?.notify?.success?.(L("SuccessfullyDeleted"));
  };

  const handleSave = async (formValues: { value: string }) => {
    const payload = new DynamicPropertyValueDto({
      ...editingValue,
      value: formValues.value,
      dynamicPropertyId: propertyId ?? 0,
      id: editingValue?.id ?? 0,
      tenantId: editingValue?.tenantId ?? 1,
    });

    if (payload.id) {
      await dynamicPropertyValueService.update(payload);
    } else {
      await dynamicPropertyValueService.add(payload);
    }
    setEditingValue(null);
    form.resetFields();
    fetchValues();
  };

  const columns = [
    { title: L("Value"), dataIndex: "value" },
    {
      title: L("Actions"),
      width: 180,
      render: (_text: string, record: DynamicPropertyValueDto) => (
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => {
              setEditingValue(record);
              form.setFieldsValue(record);
            }}
          >
            {L("Edit")}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(record.id!)}
          >
            {L("Delete")}
          </button>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={L("EditValues")}
      open={isVisible}
      onCancel={onClose}
      afterOpenChange={(opened) => {
        if (opened) {
          delayedFocus(inputRef);
        }
      }}
      footer={null}
      width={800}
    >
      <Form className="mb-5" form={form} onFinish={handleSave}>
        <Row gutter={8}>
          <Col flex="auto">
            <Form.Item name="value" rules={[{ required: true }]}>
              <input className="form-control" ref={inputRef} />
            </Form.Item>
          </Col>
          <Col>
            <button type="submit" className="btn btn-primary">
              {editingValue?.id ? L("Update") : L("Add")}
            </button>
          </Col>
        </Row>
      </Form>
      <Table
        dataSource={values}
        columns={columns}
        loading={loading}
        rowKey="id"
        size="small"
      />
    </Modal>
  );
};
export default PropertyValueModal;
