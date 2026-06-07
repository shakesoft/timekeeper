import React, { useEffect, useMemo, useRef } from "react";
import { getByName } from "./input-types.constants";
import type { InputTypeComponentProps } from "./types";

interface DynamicInputProps {
  type: string;
  selectedValues: string[];
  allValues?: string[];
  onChange: (values: string[]) => void;
  onInstance?: (instance: unknown) => void;
}

const DynamicInput: React.FC<DynamicInputProps> = ({
  type,
  selectedValues,
  allValues = [],
  onChange,
  onInstance,
}) => {
  const def = useMemo(() => getByName(type), [type]);
  const instanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (onInstance && instanceRef.current) {
      onInstance(instanceRef.current);
    }
  }, [onInstance]);

  if (!def) {
    return null;
  }

  const Component =
    def.component as React.ComponentType<InputTypeComponentProps>;

  return (
    <Component
      selectedValues={selectedValues}
      allValues={allValues}
      onChange={onChange}
      onInstance={(inst) => {
        instanceRef.current = inst;
        if (onInstance) onInstance(inst);
      }}
    />
  );
};

export default DynamicInput;
