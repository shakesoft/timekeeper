import React, { useState } from "react";
import L from "@/lib/L";

interface PasswordInputWithShowButtonProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  placeholder?: string;
}

const PasswordInputWithShowButton: React.FC<
  PasswordInputWithShowButtonProps
> = ({ value = "", onChange, onBlur, className = "", placeholder = "" }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="input-group">
      <input
        type={isVisible ? "text" : "password"}
        className={`form-control ${className}`}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
      />
      <button
        className="btn btn-primary"
        type="button"
        onClick={toggleVisibility}
      >
        {isVisible ? (
          <>
            <i className="far fa-eye-slash text-white me-1"></i>
            <span>{L("Hide")}</span>
          </>
        ) : (
          <>
            <i className="far fa-eye text-white me-1"></i>
            <span>{L("Show")}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default PasswordInputWithShowButton;
