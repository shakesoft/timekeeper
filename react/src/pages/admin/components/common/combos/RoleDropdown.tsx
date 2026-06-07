import React, { useEffect, useState } from "react";
import {
  RoleServiceProxy,
  RoleListDto,
  GetRolesInput,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

interface Props {
  value?: number | string;
  onChange?: (value?: number | string) => void;
  allowClear?: boolean;
  style?: React.CSSProperties;
}

const RoleDropdown: React.FC<Props> = ({
  value,
  onChange,
  allowClear = true,
  style,
}) => {
  const roleService = useServiceProxy(RoleServiceProxy, []);
  const [roles, setRoles] = useState<RoleListDto[]>([]);

  useEffect(() => {
    const input = new GetRolesInput({ permissions: [] });
    roleService.getRoles(input).then((res) => setRoles(res.items ?? []));
  }, [roleService]);

  return (
    <div style={style}>
      <select
        className="form-control"
        value={value ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") {
            onChange?.(undefined);
            return;
          }
          const n = Number(v);
          const parsed = Number.isNaN(n) ? v : n;
          onChange?.(parsed);
        }}
      >
        {allowClear ? (
          <option value="">{L("Select")}</option>
        ) : (
          <option value="" disabled>
            {L("FilterByRole")}
          </option>
        )}
        {(roles || []).map((r) => (
          <option key={String(r.id)} value={String(r.id)}>
            {r.displayName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoleDropdown;
