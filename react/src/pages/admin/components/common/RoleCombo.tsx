import React, { useEffect, useState } from "react";
import {
  RoleServiceProxy,
  RoleListDto,
  GetRolesInput,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

interface RoleComboProps {
  value?: number;
  onChange?: (value?: number) => void;
  className?: string;
}

const RoleCombo: React.FC<RoleComboProps> = ({
  value,
  onChange,
  className = "form-select",
}) => {
  const roleService = useServiceProxy(RoleServiceProxy, []);
  const [roles, setRoles] = useState<RoleListDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    roleService
      .getRoles(new GetRolesInput({ permissions: [] }))
      .then((result) => {
        setRoles(result.items ?? []);
      })
      .finally(() => setLoading(false));
  }, [roleService]);

  return (
    <select
      className={className}
      value={value ?? ""}
      onChange={(e) => {
        const val = e.target.value;
        onChange?.(val ? parseInt(val) : undefined);
      }}
      disabled={loading}
    >
      <option value="">{L("FilterByRole")}</option>
      {roles.map((role) => (
        <option key={role.id} value={role.id}>
          {role.displayName}
        </option>
      ))}
    </select>
  );
};

export default RoleCombo;
