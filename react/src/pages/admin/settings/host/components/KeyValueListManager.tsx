import React from "react";
import L from "@/lib/L";

export interface KeyValueItem {
  key: string;
  value: string;
}

interface Props {
  header?: string;
  keyPlaceHolder?: string;
  valuePlaceHolder?: string;
  items: KeyValueItem[];
  onChange?: (items: KeyValueItem[]) => void;
}

const KeyValueListManager: React.FC<Props> = ({
  header,
  keyPlaceHolder,
  valuePlaceHolder,
  items,
  onChange,
}) => {
  const update = (next: KeyValueItem[]) => {
    onChange?.(next);
  };

  const list = items ?? [];
  const addRow = () => update([...list, { key: "", value: "" }]);
  const removeRow = (index: number) =>
    update(list.filter((_, i) => i !== index));
  const changeRow = (index: number, patch: Partial<KeyValueItem>) => {
    const next = list.map((it, i) => (i === index ? { ...it, ...patch } : it));
    update(next);
  };

  return (
    <div>
      {header && <h5 className="mb-3 mt-3">{header}</h5>}
      <div className="d-flex flex-column">
        {list.map((item, idx) => (
          <div key={idx} className="d-flex align-items-start mb-3 w-100 gap-3">
            <input
              placeholder={keyPlaceHolder}
              value={item.key}
              onChange={(e) =>
                changeRow(idx, { key: (e.target as HTMLInputElement).value })
              }
              className="form-control"
            />
            <input
              placeholder={valuePlaceHolder}
              value={item.value}
              onChange={(e) =>
                changeRow(idx, { value: (e.target as HTMLInputElement).value })
              }
              className="form-control"
            />
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => removeRow(idx)}
            >
              {L("Delete")}
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-primary w-25" onClick={addRow}>
          {L("Add")}
        </button>
      </div>
    </div>
  );
};

export default KeyValueListManager;
