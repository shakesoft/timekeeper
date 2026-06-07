import React, { useEffect, useRef, useState } from "react";
import { Modal, Spin, message } from "antd";
import {
  EntityDto,
  TenantServiceProxy,
  UpdateTenantFeaturesInput,
  type GetTenantFeaturesEditOutput,
} from "@api/generated/service-proxies";
import FeatureTree, {
  type FeatureTreeRef,
} from "../../components/common/trees/FeatureTree";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

type Props = {
  isVisible: boolean;
  tenantId?: number;
  tenantName?: string;
  onClose: () => void;
};

const TenantFeaturesModal: React.FC<Props> = ({
  isVisible,
  tenantId,
  tenantName,
  onClose,
}) => {
  const tenantService = useServiceProxy(TenantServiceProxy, []);
  const treeRef = useRef<FeatureTreeRef>(null);

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState<GetTenantFeaturesEditOutput | null>(
    null,
  );

  useEffect(() => {
    if (!isVisible || !tenantId) return;
    setLoading(true);
    tenantService
      .getTenantFeaturesForEdit(tenantId)
      .then((res) => setEditData(res))
      .finally(() => setLoading(false));
  }, [isVisible, tenantId, tenantService]);

  const handleSave = async () => {
    if (!tenantId) return;
    const tree = treeRef.current;
    if (!tree) return;
    if (!tree.areAllValuesValid()) {
      message.warning(L("InvalidFeaturesWarning"));
      return;
    }
    const input = new UpdateTenantFeaturesInput();
    input.id = tenantId;
    input.featureValues = tree.getGrantedFeatures();
    setSaving(true);
    try {
      await tenantService.updateTenantFeatures(input);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!tenantId) return;
    const dto = new EntityDto();
    dto.id = tenantId;
    setResetting(true);
    try {
      await tenantService.resetTenantSpecificFeatures(dto);
      const result = await tenantService.getTenantFeaturesForEdit(tenantId);
      setEditData(result);
    } finally {
      setResetting(false);
    }
  };

  return (
    <Modal
      title={`${L("Features")} - ${tenantName ?? ""}`}
      open={isVisible}
      onCancel={onClose}
      width={800}
      footer={[
        <button
          key="reset"
          type="button"
          className="btn btn-secondary float-start d-inline-flex align-items-center"
          onClick={handleReset}
          disabled={saving || resetting}
        >
          {resetting && (
            <span className="spinner-border spinner-border-sm me-2"></span>
          )}
          <span className="align-middle">{L("ResetSpecialFeatures")}</span>
        </button>,
        <button
          key="cancel"
          type="button"
          className="btn btn-light-primary fw-bold"
          onClick={onClose}
          disabled={saving || resetting}
        >
          {L("Cancel")}
        </button>,
        <button
          key="save"
          type="button"
          className="btn btn-primary fw-bold d-inline-flex align-items-center"
          onClick={handleSave}
          disabled={saving || resetting}
        >
          {saving && (
            <span className="spinner-border spinner-border-sm me-2"></span>
          )}
          <i className="fa fa-save me-2 align-middle"></i>
          <span className="align-middle">{L("Save")}</span>
        </button>,
      ]}
    >
      <Spin spinning={loading}>
        {editData && (
          <FeatureTree
            ref={treeRef}
            editData={{
              features: editData.features || [],
              featureValues: editData.featureValues || [],
            }}
          />
        )}
      </Spin>
    </Modal>
  );
};

export default TenantFeaturesModal;
