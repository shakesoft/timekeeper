import React, { useEffect, useRef, useState } from "react";
import type { InputTypeComponentProps } from "../types";

const ComboboxInput: React.FC<InputTypeComponentProps> = ({
  selectedValues,
  allValues,
  onChange,
  onInstance,
}) => {
  const [value, setValue] = useState<string>(selectedValues?.[0] ?? "");
  const ref = useRef<{ getSelectedValues: () => string[] } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(selectedValues?.[0] ?? "");
  }, [selectedValues]);

  useEffect(() => {
    ref.current = {
      getSelectedValues: () => (value ? [value] : []),
    };
    if (onInstance) onInstance(ref.current);
  }, [value, onInstance]);

  return (
    <select
      className="form-control"
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        setValue(v);
        onChange(v ? [v] : []);
      }}
      style={{ width: "100%" }}
    >
      <option value=""></option>
      {(allValues ?? []).map((v) => (
        <option key={v} value={v}>
          {v}
        </option>
      ))}
    </select>
  );
};

export default ComboboxInput;
