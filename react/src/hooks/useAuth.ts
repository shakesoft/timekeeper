import { useSelector } from "react-redux";
import { useMemo } from "react";
import type { RootState } from "../app/store";
import { type User } from "../app/slices/authSlice";
import { hardLogout } from "@/lib/auth-helpers";

export interface UseAuthReturn {
  currentUser: User | null;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const { user, token, isLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  const abpToken = useMemo(() => abp?.auth?.getToken?.() || "", []);
  const isAuthenticated = !!token || !!abpToken;

  const logout = () => {
    hardLogout();
    window.location.href = "/account/login";
  };

  return {
    currentUser: user,
    isAuthenticated,
    token: token || abpToken,
    isLoading,
    logout,
  };
};
