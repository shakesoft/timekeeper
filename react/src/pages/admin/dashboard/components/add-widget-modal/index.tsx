import React, { useEffect, useState } from "react";
import { Modal, Select, Typography } from "antd";
import {
  DashboardCustomizationServiceProxy,
  WidgetOutput,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import { DashboardCustomizationConst } from "../../customizable-dashboard/types";
import L from "@/lib/L";

interface Props {
  visible: boolean;
  dashboardName: string;
  pageId: string;
  onClose: (selectedWidgetId?: string | null) => void;
}

const AddWidgetModal: React.FC<Props> = ({
  visible,
  dashboardName,
  pageId,
  onClose,
}) => {
  const dashboardService = useServiceProxy(
    DashboardCustomizationServiceProxy,
    [],
  );
  const [widgets, setWidgets] = useState<WidgetOutput[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | undefined>();

  useEffect(() => {
    if (!visible) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const defs =
          await dashboardService.getAllAvailableWidgetDefinitionsForPage(
            dashboardName,
            DashboardCustomizationConst.Applications.React,
            pageId,
          );
        if (mounted) {
          setWidgets(defs || []);
          setSelected(defs && defs.length ? defs[0].id : undefined);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [visible, dashboardName, pageId, dashboardService]);

  return (
    <Modal
      open={visible}
      title={L("AddWidget")}
      onCancel={() => onClose(null)}
      mask={{ closable: false }}
      keyboard={false}
      width={800}
      footer={[
        <button
          key="cancel"
          type="button"
          className="btn btn-light-primary fw-bold"
          onClick={() => onClose(null)}
        >
          {L("Cancel")}
        </button>,
        <button
          key="save"
          type="submit"
          className="btn btn-primary fw-bold d-inline-flex align-items-center"
          onClick={() => onClose(selected!)}
          disabled={!selected}
        >
          <i className="fa fa-save align-middle me-2"></i>
          <span className="align-middle">{L("Save")}</span>
        </button>,
      ]}
    >
      {widgets && widgets.length > 0 ? (
        <Select
          loading={loading}
          className="form-select mb-10"
          value={selected}
          onChange={setSelected}
          autoFocus
          options={(widgets || []).map((w) => ({
            label: L(w.name || w.id || ""),
            value: w.id!,
          }))}
        />
      ) : (
        <Typography.Text>{L("NoWidgetAvailableMessage")}</Typography.Text>
      )}
    </Modal>
  );
};

export default AddWidgetModal;
