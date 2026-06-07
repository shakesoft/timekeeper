import React, { useState, useEffect } from "react";
import { Modal, Form, Select, Typography } from "antd";

import { Link } from "react-router-dom";
import {
  ComboboxItemDto,
  CommonLookupServiceProxy,
  EditionServiceProxy,
  MoveTenantsToAnotherEditionDto,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

const { Text } = Typography;

interface Props {
  isVisible: boolean;
  onClose: () => void;
  sourceEditionId?: number;
}

const MoveTenantsModal: React.FC<Props> = ({
  isVisible,
  onClose,
  sourceEditionId,
}) => {
  const [form] = Form.useForm();
  const editionService = useServiceProxy(EditionServiceProxy, []);
  const commonLookupService = useServiceProxy(CommonLookupServiceProxy, []);

  const [saving, setSaving] = useState(false);
  const [tenantCount, setTenantCount] = useState(0);
  const [targetEditions, setTargetEditions] = useState<ComboboxItemDto[]>([]);

  useEffect(() => {
    if (!isVisible || !sourceEditionId) {
      return;
    }

    commonLookupService.getEditionsForCombobox(undefined).then((result) => {
      setTargetEditions(
        (result.items ?? []).filter(
          (item) => item.value !== sourceEditionId.toString(),
        ),
      );
    });

    editionService.getTenantCount(sourceEditionId).then(setTenantCount);
  }, [isVisible, sourceEditionId, commonLookupService, editionService]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const input = new MoveTenantsToAnotherEditionDto({
        sourceEditionId: sourceEditionId ?? 0,
        targetEditionId: values.targetEditionId ?? 0,
      });

      await editionService.moveTenantsToAnotherEdition(input);
      abp.notify.info(L("MoveTenantsToAnotherEditionStartedNotification"));
      onClose();
      form.resetFields();
    } catch {
      abp.notify.error(L("Error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={L("MoveTenantsToAnotherEdition")}
      open={isVisible}
      onCancel={onClose}
      footer={[
        <button
          key="cancel"
          type="button"
          className="btn btn-light-primary fw-bold"
          onClick={onClose}
          disabled={saving}
        >
          {L("Cancel")}
        </button>,
        <button
          key="save"
          type="button"
          className="btn btn-primary fw-bold d-inline-flex align-items-center"
          onClick={handleSave}
          disabled={saving}
        >
          {saving && (
            <span className="spinner-border spinner-border-sm me-2"></span>
          )}
          <i className="fa fa-save me-2 align-middle"></i>
          <span className="align-middle">{L("Save")}</span>
        </button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item>
          <Text>
            <Link
              to={`/app/admin/tenants?editionId=${sourceEditionId}`}
              target="_blank"
            >
              {L("MoveTenantsOfEditionDescription", tenantCount)}
            </Link>
          </Text>
        </Form.Item>
        <Form.Item
          name="targetEditionId"
          label={L("Edition")}
          rules={[{ required: true, message: L("ThisFieldIsRequired") }]}
        >
          <Select
            placeholder={L("Select")}
            allowClear
            className="form-select mb-5"
          >
            {targetEditions.map((edition) => (
              <Select.Option
                key={edition.value}
                value={parseInt(edition.value!, 10)}
              >
                {edition.displayText}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MoveTenantsModal;
