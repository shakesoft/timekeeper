import React from "react";
import CustomizableDashboard from "../customizable-dashboard";
import { DashboardCustomizationConst } from "../customizable-dashboard/types";
import { useTheme } from "@/hooks/useTheme";

const HostDashboardPage: React.FC = () => {
  const { containerClass } = useTheme();

  return (
    <div className={containerClass}>
      <CustomizableDashboard
        dashboardName={
          DashboardCustomizationConst.dashboardNames.defaultHostDashboard
        }
      />
    </div>
  );
};

export default HostDashboardPage;
