import React, { useEffect, useMemo, useState } from "react";
import { useServiceProxy } from "@/api/service-proxy-factory";
import {
  NameValueDto,
  SettingScopes,
  TimingServiceProxy,
  ListResultDtoOfNameValueDto,
} from "../../../../../api/generated/service-proxies";

type Props = {
  value?: string | null;
  onChange?: (val: string | null) => void;
  defaultTimezoneScope?: SettingScopes;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
};

const TimezoneDropdown: React.FC<Props> = ({
  value,
  onChange,
  defaultTimezoneScope,
  placeholder,
  disabled,
  style,
}) => {
  const [items, setItems] = useState<NameValueDto[]>([]);
  const timingService = useServiceProxy(TimingServiceProxy);

  useEffect(() => {
    let mounted = true;
    timingService
      .getTimezones(defaultTimezoneScope!)
      .then((res: ListResultDtoOfNameValueDto) => {
        if (!mounted) return;
        setItems(res.items ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setItems([]);
      });
    return () => {
      mounted = false;
    };
  }, [timingService, defaultTimezoneScope]);

  type OptionType = { label: React.ReactNode; value: string };

  const options: OptionType[] = useMemo(
    () =>
      items.map((i) => ({
        label: i.name ?? i.value ?? "",
        value: i.value ?? "",
      })),
    [items],
  );

  return (
    <div style={{ width: "100%", ...style }}>
      <select
        className="form-control"
        disabled={disabled}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value || null)}
      >
        <option value="">{placeholder}</option>
        {options?.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimezoneDropdown;
