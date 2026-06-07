import React, { useEffect, useRef, useState } from "react";
import type { InputTypeComponentProps } from "../types";

const SingleLineStringInput: React.FC<InputTypeComponentProps> = ({
  selectedValues,
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
    <input
      className="form-control"
      value={value}
      onChange={(e) => {
        const next = e.target.value;
        setValue(next);
        onChange(next ? [next] : []);
      }}
    />
  );
};

export default SingleLineStringInput;
