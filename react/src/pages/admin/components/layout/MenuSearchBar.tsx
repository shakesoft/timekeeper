import React, { useState, useCallback, useMemo } from "react";
import { AutoComplete } from "antd";
import { useNavigate } from "react-router-dom";
import { useMenuSearchSource } from "../../../../lib/navigation/appNavigation";

interface SearchOption {
  value: string;
  label: React.ReactNode;
  route: string;
  external?: boolean;
  parameters?: Record<string, unknown>;
}

const MenuSearchBar: React.FC<{ placeholder?: string; minLength?: number }> = ({
  placeholder = "Quick Search...",
  minLength = 1,
}) => {
  const source = useMenuSearchSource();
  const navigate = useNavigate();
  const [options, setOptions] = useState<SearchOption[]>([]);
  const [value, setValue] = useState("");

  const onSearch = useCallback(
    (text: string) => {
      setValue(text);
      if (!text || text.length < minLength) {
        setOptions([]);
        return;
      }
      const lower = text.toLowerCase();
      const filtered = source
        .filter(
          (i) =>
            i.name.toLowerCase().includes(lower) ||
            i.route!.toLowerCase().includes(lower),
        )
        .slice(0, 20)
        .map((i) => ({
          value: i.route!,
          label: (
            <div className="d-flex flex-column">
              <span>{i.name}</span>
              <small className="text-muted">{i.route}</small>
            </div>
          ),
          route: i.route!,
          external: i.external,
          parameters: i.parameters,
        }));
      setOptions(filtered);
    },
    [source, minLength],
  );

  const onSelect = useCallback(
    (route: string, option: SearchOption) => {
      if (!route) return;
      if (option?.external) {
        window.open(route, "_blank", "noopener");
        return;
      }
      navigate(route, { replace: false });
      setValue("");
      setOptions([]);
    },
    [navigate],
  );

  const autoCompleteOptions = useMemo(() => options, [options]);

  return (
    <div className="pt-3 pb-2">
      <AutoComplete
        value={value}
        options={autoCompleteOptions}
        onSelect={onSelect}
        onSearch={onSearch}
        style={{ width: "100%" }}
        placeholder={placeholder}
        popupMatchSelectWidth={false}
        filterOption={false}
      ></AutoComplete>
    </div>
  );
};

export default MenuSearchBar;
