import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const sessionLoaded = useSelector(
    (state: RootState) => state.session.isLoaded,
  );

  if (!isAuthenticated) {
    return <Navigate to="/account/login" replace />;
  }

  if (!sessionLoaded) {
    return null;
  }

  return <Outlet />;
};

export default ProtectedRoute;
