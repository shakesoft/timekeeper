import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import L from "@/lib/L";

export interface KeyValueItem {
  key: string;
  value: string;
}

export interface KeyValueListManagerProps {
  items: KeyValueItem[];
  onChange: (items: KeyValueItem[]) => void;
  header?: React.ReactNode | string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  className?: string;
}

const KeyValueListManager: React.FC<KeyValueListManagerProps> = ({
  items,
  onChange,
  header,
  keyPlaceholder,
  valuePlaceholder,
  className,
}) => {
  const [editKeyInput, setEditKeyInput] = useState<string>("");
  const [editValueInput, setEditValueInput] = useState<string>("");

  const indexOfKeyInItems = useMemo(
    () => items.findIndex((item) => item.key === editKeyInput),
    [items, editKeyInput],
  );

  const isEditingExisting = indexOfKeyInItems !== -1;

  useEffect(() => {
    if (indexOfKeyInItems !== -1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditValueInput(items[indexOfKeyInItems].value);
    }
  }, [editKeyInput, items, indexOfKeyInItems]);

  const handleRemove = useCallback(
    (itemToRemove: KeyValueItem) => {
      const nextItems = items.filter((i) => i.key !== itemToRemove.key);
      onChange(nextItems);

      const stillExists = nextItems.some((i) => i.key === editKeyInput);
      if (stillExists) {
        const value =
          nextItems.find((i) => i.key === editKeyInput)?.value ?? "";
        setEditValueInput(value);
      } else if (itemToRemove.key === editKeyInput) {
        setEditKeyInput("");
        setEditValueInput("");
      }
    },
    [items, onChange, editKeyInput],
  );

  const handleOpenEdit = useCallback((item: KeyValueItem) => {
    setEditKeyInput(item.key);
    setEditValueInput(item.value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!editKeyInput || !editValueInput) return;

    const newItem: KeyValueItem = { key: editKeyInput, value: editValueInput };

    if (indexOfKeyInItems !== -1) {
      const next = items.map((i) => (i.key === newItem.key ? newItem : i));
      onChange(next);
    } else {
      const next = [...items, newItem];
      onChange(next);
    }

    setEditKeyInput("");
    setEditValueInput("");
  }, [editKeyInput, editValueInput, indexOfKeyInItems, items, onChange]);

  return (
    <div className={className}>
      {header && (
        <label className="form-label mb-2" style={{ display: "block" }}>
          {header}
        </label>
      )}

      <div
        className="d-flex gap-2 mb-2"
        role="group"
        aria-label="key-value-add-edit"
      >
        <input
          type="text"
          className="form-control"
          placeholder={keyPlaceholder || L("Key")}
          value={editKeyInput}
          onChange={(e) => setEditKeyInput(e.target.value)}
        />
        <input
          type="text"
          className="form-control"
          placeholder={valuePlaceholder || L("Value")}
          value={editValueInput}
          onChange={(e) => setEditValueInput(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
        >
          {isEditingExisting ? L("Edit") : L("Add")}
        </button>
      </div>

      {items.length > 0 && (
        <div className="key-value-items-list">
          {items.map((item) => {
            const isActive = editKeyInput === item.key;
            return (
              <div
                key={item.key}
                className={`alert alert-custom m-1 min-h-60px ${
                  isActive ? "alert-warning" : "alert-white"
                }`}
                role="alert"
              >
                <span>
                  "{item.key}" : "{item.value}"
                </span>
                <div className="float-end d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-icon btn-danger"
                    onClick={() => handleRemove(item)}
                    aria-label={L("Delete")}
                  >
                    <DeleteOutlined />
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-icon btn-primary"
                    onClick={() => handleOpenEdit(item)}
                    aria-label={L("Edit")}
                  >
                    <EditOutlined />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KeyValueListManager;
