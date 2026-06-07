import React, { useEffect, useMemo, useRef, useState } from "react";
import type { InputTypeComponentProps } from "../types";

const MultiSelectComboboxInput: React.FC<InputTypeComponentProps> = ({
  selectedValues,
  allValues,
  onChange,
  onInstance,
}) => {
  const [values, setValues] = useState<string[]>(selectedValues ?? []);
  const ref = useRef<{ getSelectedValues: () => string[] } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues(selectedValues ?? []);
  }, [selectedValues]);

  useEffect(() => {
    ref.current = {
      getSelectedValues: () => values,
    };
    if (onInstance) onInstance(ref.current);
  }, [values, onInstance]);

  const options = useMemo(
    () => (allValues ?? []).map((v) => ({ label: v, value: v })),
    [allValues],
  );

  return (
    <select
      className="form-control"
      multiple
      value={values}
      onChange={(e) => {
        const selected = Array.from(e.target.selectedOptions).map(
          (o) => o.value,
        );
        const next = selected ?? [];
        setValues(next);
        onChange(next);
      }}
      style={{ width: "100%" }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default MultiSelectComboboxInput;
