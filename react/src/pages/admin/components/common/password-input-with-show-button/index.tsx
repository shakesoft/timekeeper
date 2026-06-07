import React, { useCallback, useEffect, useState } from "react";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import L from "@/lib/L";

export interface PasswordInputWithShowButtonProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const PasswordInputWithShowButton: React.FC<
  PasswordInputWithShowButtonProps
> = ({ value, defaultValue, onChange, placeholder, disabled, className }) => {
  const [internalValue, setInternalValue] = useState<string>(
    value ?? defaultValue ?? "",
  );
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (value !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInternalValue(value ?? "");
    }
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setInternalValue(next);
      if (onChange) onChange(next);
    },
    [onChange],
  );

  const toggleVisibility = useCallback(() => {
    setIsVisible((s) => !s);
  }, []);

  return (
    <div className={`input-group ${className ?? ""}`.trim()}>
      <input
        className="form-control"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        type={isVisible ? "text" : "password"}
      />
      <div className="input-group-append" style={{ marginLeft: 8 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={toggleVisibility}
          aria-label={isVisible ? L("Hide") : L("Show")}
        >
          {isVisible ? (
            <>
              <EyeInvisibleOutlined style={{ marginRight: 6 }} />
              {L("Hide")}
            </>
          ) : (
            <>
              <EyeOutlined style={{ marginRight: 6 }} />
              {L("Show")}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordInputWithShowButton;
