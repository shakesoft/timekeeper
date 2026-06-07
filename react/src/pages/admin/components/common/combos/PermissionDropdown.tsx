import React, { useEffect, useState } from "react";
import {
  PermissionServiceProxy,
  FlatPermissionWithLevelDto,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

interface Props {
  value?: string;
  onChange?: (value?: string) => void;
  allowClear?: boolean;
  style?: React.CSSProperties;
}

const PermissionDropdown: React.FC<Props> = ({
  value,
  onChange,
  allowClear = true,
  style,
}) => {
  const permissionService = useServiceProxy(PermissionServiceProxy, []);
  const [permissions, setPermissions] = useState<FlatPermissionWithLevelDto[]>(
    [],
  );

  useEffect(() => {
    permissionService.getAllPermissions().then((res) => {
      const items = res.items ?? [];
      items.forEach((item) => {
        item.displayName = `${Array((item.level ?? 0) + 1).join("---")} ${item.displayName}`;
      });
      setPermissions(items);
    });
  }, [permissionService]);

  return (
    <div style={style}>
      <select
        className="form-control"
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value || undefined)}
      >
        {allowClear && <option value="">{L("Select")}</option>}
        {(permissions || []).map((p) => (
          <option key={p.name} value={p.name}>
            {p.displayName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PermissionDropdown;
