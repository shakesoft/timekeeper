import { useCallback, useEffect, useState } from "react";
import { DynamicEntityPropertyServiceProxy } from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import { usePermissions } from "./usePermissions";
import { L } from "@/lib/L";

interface DynamicPropsModalState {
  visible: boolean;
  entityFullName?: string;
  entityId?: string;
}

interface UseDynamicEntityPropertyManagerResult {
  canShow: (entityFullName: string) => boolean;
  dynamicPropsModal: DynamicPropsModalState;
  openDynamicPropsModal: (entityFullName: string, entityId: string) => void;
  closeDynamicPropsModal: () => void;
}

export function useDynamicEntityPropertyManager(): UseDynamicEntityPropertyManagerResult {
  const { isGranted } = usePermissions();
  const dynamicEntityPropertyService = useServiceProxy(
    DynamicEntityPropertyServiceProxy,
    [],
  );

  const [entityNames, setEntityNames] = useState<string[]>([]);
  const [dynamicPropsModal, setDynamicPropsModal] =
    useState<DynamicPropsModalState>({ visible: false });

  const hasPermission = useCallback((): boolean => {
    return (
      isGranted("Pages.Administration.DynamicEntityProperties") &&
      isGranted("Pages.Administration.DynamicEntityPropertyValue.Edit")
    );
  }, [isGranted]);

  useEffect(() => {
    if (!hasPermission()) {
      return;
    }

    dynamicEntityPropertyService
      .getAllEntitiesHasDynamicProperty()
      .then((result) => {
        if (result?.items) {
          setEntityNames(result.items.map((i) => i.entityFullName || ""));
        }
      })
      .catch(() => {
        abp?.notify?.error?.(L("FailedToLoadEntitiesWithDynamicProperties"));
      });
  }, [hasPermission, dynamicEntityPropertyService]);

  const canShow = useCallback(
    (entityFullName: string): boolean => {
      return hasPermission() && entityNames.indexOf(entityFullName) > -1;
    },
    [hasPermission, entityNames],
  );

  const openDynamicPropsModal = useCallback(
    (entityFullName: string, entityId: string) => {
      setDynamicPropsModal({ visible: true, entityFullName, entityId });
    },
    [],
  );

  const closeDynamicPropsModal = useCallback(() => {
    setDynamicPropsModal({ visible: false });
  }, []);

  return {
    canShow,
    dynamicPropsModal,
    openDynamicPropsModal,
    closeDynamicPropsModal,
  };
}
