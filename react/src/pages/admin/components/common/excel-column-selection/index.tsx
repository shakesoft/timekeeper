import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "antd";
import L from "@/lib/L";

interface Props {
  open: boolean;
  columns: string[];
  onClose: () => void;
  onSelect: (selectedColumns: string[]) => void;
}

const ExcelColumnSelectionModal: React.FC<Props> = ({
  open,
  columns,
  onClose,
  onSelect,
}) => {
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setSelectedSet(new Set());
    }
  }, [open, columns]);

  const allSelected = useMemo(
    () => columns.length > 0 && selectedSet.size === columns.length,
    [columns, selectedSet],
  );
  const toggleAllBtnText = allSelected ? L("UnselectAll") : L("SelectAll");

  const toggleAll = () => {
    if (allSelected) {
      setSelectedSet(new Set());
    } else {
      setSelectedSet(new Set(columns));
    }
  };

  const onCheckboxChange =
    (column: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedSet((prev) => {
        const next = new Set(prev);
        if (e.target.checked) {
          next.add(column);
        } else {
          next.delete(column);
        }
        return next;
      });
    };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      onSelect(Array.from(selectedSet));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={L("ChooseColumnsForExcelExport")}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnHidden
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="m-0">{L("Columns")}</h4>
        <button
          key="toggleAll"
          type="button"
          className="btn btn-primary btn-sm fw-bold"
          onClick={toggleAll}
        >
          {toggleAllBtnText}
        </button>
      </div>

      <div>
        {columns.map((column, i) => (
          <label
            key={column}
            className="form-check form-check-custom form-check-solid py-1"
          >
            <input
              type="checkbox"
              className="form-check-input"
              id={`column${i}`}
              checked={selectedSet.has(column)}
              onChange={onCheckboxChange(column)}
            />
            <span className="form-check-label">{column}</span>
          </label>
        ))}
      </div>

      <div className="d-flex justify-content-end gap-2 mt-6">
        <button
          key="cancel"
          type="button"
          className="btn btn-light-primary fw-bold"
          onClick={onClose}
          disabled={saving}
        >
          {L("Cancel")}
        </button>
        <button
          type="button"
          className="btn btn-primary fw-bold"
          onClick={handleSubmit}
          disabled={saving || selectedSet.size === 0}
        >
          {saving ? L("SavingWithThreeDot") : L("ExportExcel")}
        </button>
      </div>
    </Modal>
  );
};

export default ExcelColumnSelectionModal;
