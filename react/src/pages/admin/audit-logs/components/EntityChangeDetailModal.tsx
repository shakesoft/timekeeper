import React from "react";
import type { EntityChangeListDto } from "@/api/generated/service-proxies";
import EntityChangeDetailModalCommon from "../../components/common/entity-history/EntityChangeDetailModal";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  record: EntityChangeListDto | null;
}

const EntityChangeDetailModal: React.FC<Props> = ({
  isVisible,
  onClose,
  record,
}) => {
  return (
    <EntityChangeDetailModalCommon
      open={isVisible}
      onClose={onClose}
      entityChange={record ?? undefined}
    />
  );
};

export default EntityChangeDetailModal;
