import { useCallback } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../app/store";

interface PermissionsOutput {
  isGranted: (permissionName: string) => boolean;
  isGrantedAny: (...permissionNames: string[]) => boolean;
}

export const usePermissions = (): PermissionsOutput => {
  const permissions = useSelector(
    (state: RootState) => state.session.permissions,
  );

  const isGranted = useCallback(
    (permissionName: string): boolean => {
      if (!permissionName) {
        return true;
      }

      if (!permissions) {
        return false;
      }

      return !!permissions[permissionName];
    },
    [permissions],
  );

  const isGrantedAny = useCallback(
    (...permissionNames: string[]): boolean => {
      if (!permissionNames || permissionNames.length === 0) {
        return true;
      }

      if (!permissions) {
        return false;
      }

      for (const permissionName of permissionNames) {
        if (isGranted(permissionName)) {
          return true;
        }
      }

      return false;
    },
    [permissions, isGranted],
  );

  return { isGranted, isGrantedAny };
};
