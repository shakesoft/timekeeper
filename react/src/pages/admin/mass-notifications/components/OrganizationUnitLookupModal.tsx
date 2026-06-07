import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import {
  OrganizationUnitDto,
  OrganizationUnitServiceProxy,
} from "@api/generated/service-proxies";
import L from "@/lib/L";
import OrganizationUnitsTree from "../../components/common/trees/OrganizationUnitTree";
import { useServiceProxy } from "@/api/service-proxy-factory";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSave: (selectedOus: { id: number; displayName: string }[]) => void;
}

const OrganizationUnitLookupModal: React.FC<Props> = ({
  isVisible,
  onClose,
  onSave,
}) => {
  const [allOrganizationUnits, setAllOrganizationUnits] = useState<
    OrganizationUnitDto[]
  >([]);
  const [selectedOrganizationUnitIds, setSelectedOrganizationUnitIds] =
    useState<number[]>([]);
  const organizationUnitService = useServiceProxy(
    OrganizationUnitServiceProxy,
    [],
  );

  useEffect(() => {
    if (!isVisible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedOrganizationUnitIds([]);
      return;
    }

    organizationUnitService
      .getOrganizationUnits()
      .then((result) => setAllOrganizationUnits(result.items ?? []))
      .catch(() => setAllOrganizationUnits([]));
  }, [isVisible, organizationUnitService]);

  const handleSave = () => {
    if (selectedOrganizationUnitIds.length > 0) {
      const idSet = new Set(
        selectedOrganizationUnitIds.map((id) => Number(id)),
      );
      const selectedOus = (allOrganizationUnits || []).filter(
        (ou) => ou.id != null && idSet.has(ou.id),
      );
      onSave(
        selectedOus.map((ou) => ({
          id: ou.id!,
          displayName: ou.displayName ?? "",
        })),
      );
    }
    onClose();
  };

  return (
    <Modal
      title={L("SearchOrganizationUnit")}
      open={isVisible}
      onCancel={onClose}
      footer={[
        <button
          key="cancel"
          type="button"
          className="btn btn-light-primary fw-bold"
          onClick={onClose}
        >
          {L("Cancel")}
        </button>,
        <button
          key="save"
          type="button"
          className="btn btn-primary fw-bold"
          onClick={handleSave}
          disabled={selectedOrganizationUnitIds.length === 0}
        >
          {L("Select")}
        </button>,
      ]}
    >
      <OrganizationUnitsTree
        allOrganizationUnits={allOrganizationUnits}
        selectedOrganizationUnitIds={selectedOrganizationUnitIds}
        onChange={setSelectedOrganizationUnitIds}
      />
    </Modal>
  );
};
export default OrganizationUnitLookupModal;
