import React from "react";
import type { DynamicInputProps } from "./types";

const SingleLineStringInput: React.FC<DynamicInputProps> = ({
  value,
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <input className="form-control" value={value} onChange={handleChange} />
  );
};

export default SingleLineStringInput;
