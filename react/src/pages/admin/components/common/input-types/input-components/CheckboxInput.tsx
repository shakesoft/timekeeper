import React, { useEffect, useRef, useState } from "react";
import type { InputTypeComponentProps } from "../types";

const CheckboxInput: React.FC<InputTypeComponentProps> = ({
  selectedValues,
  onChange,
  onInstance,
}) => {
  const [checked, setChecked] = useState<boolean>(
    (selectedValues?.[0] ?? "false") === "true",
  );
  const ref = useRef<{ getSelectedValues: () => string[] } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChecked((selectedValues?.[0] ?? "false") === "true");
  }, [selectedValues]);

  useEffect(() => {
    ref.current = {
      getSelectedValues: () => [checked.toString()],
    };
    if (onInstance) onInstance(ref.current);
  }, [checked, onInstance]);

  return (
    <div className="form-check">
      <input
        type="checkbox"
        className="form-check-input"
        checked={checked}
        onChange={(e) => {
          const next = e.target.checked;
          setChecked(next);
          onChange([next.toString()]);
        }}
      />
    </div>
  );
};

export default CheckboxInput;
