import { Dayjs } from "dayjs";
import React from "react";

export const DashboardCustomizationConst = {
  widgets: {
    tenant: {
      profitShare: "Widgets_Tenant_ProfitShare",
      memberActivity: "Widgets_Tenant_MemberActivity",
      regionalStats: "Widgets_Tenant_RegionalStats",
      salesSummary: "Widgets_Tenant_SalesSummary",
      topStats: "Widgets_Tenant_TopStats",
      generalStats: "Widgets_Tenant_GeneralStats",
      dailySales: "Widgets_Tenant_DailySales",
    },
    host: {
      topStats: "Widgets_Host_TopStats",
      incomeStatistics: "Widgets_Host_IncomeStatistics",
      editionStatistics: "Widgets_Host_EditionStatistics",
      subscriptionExpiringTenants: "Widgets_Host_SubscriptionExpiringTenants",
      recentTenants: "Widgets_Host_RecentTenants",
    },
  },
  filters: {
    filterDateRangePicker: "Filters_DateRangePicker",
  },
  dashboardNames: {
    defaultTenantDashboard: "TenantDashboard",
    defaultHostDashboard: "HostDashboard",
  },
  Applications: {
    React: "React",
  },
} as const;

export type WidgetId =
  | (typeof DashboardCustomizationConst.widgets.tenant)[keyof typeof DashboardCustomizationConst.widgets.tenant]
  | (typeof DashboardCustomizationConst.widgets.host)[keyof typeof DashboardCustomizationConst.widgets.host];

export interface GridInformation {
  id: string;
  cols: number;
  rows: number;
  x: number;
  y: number;
}

export interface UserWidgetViewModel {
  id: string;
  guid: string;
  component: React.ComponentType;
  gridInformation: GridInformation;
}

export interface UserPageViewModel {
  id: string;
  name: string;
  widgets: UserWidgetViewModel[];
}

export interface UserDashboardViewModel {
  dashboardName?: string;
  filters: Array<{
    id: string;
    name: string;
    component: React.ComponentType;
  }>;
  pages: UserPageViewModel[];
}

export interface WidgetViewDefinition {
  id: WidgetId;
  component: React.ComponentType;
  defaultWidth: number;
  defaultHeight: number;
}

export interface WidgetFilterViewDefinition {
  id: string;
  name?: string;
  component: React.ComponentType;
}

export interface DashboardContextState {
  selectedDateRange: [Dayjs, Dayjs];
  setSelectedDateRange: (value: [Dayjs, Dayjs]) => void;
}

export const DashboardContext = React.createContext<
  DashboardContextState | undefined
>(undefined);
