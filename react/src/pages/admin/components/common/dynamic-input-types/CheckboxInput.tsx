import React from "react";
import type { DynamicInputProps } from "./types";

const CheckboxInput: React.FC<DynamicInputProps> = ({ value, onChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked ? "true" : "false");
  };

  return (
    <div className="form-check">
      <input
        type="checkbox"
        className="form-check-input"
        checked={!!value}
        onChange={handleChange}
      />
    </div>
  );
};

export default CheckboxInput;
