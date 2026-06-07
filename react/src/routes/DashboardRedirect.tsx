import React from "react";
import { Navigate } from "react-router-dom";
import { getDashboardUrl } from "../lib/dashboard-helper";

const DashboardRedirect: React.FC = () => {
  const dashboardUrl = getDashboardUrl();

  return <Navigate to={dashboardUrl} replace />;
};

export default DashboardRedirect;
