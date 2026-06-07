import { useMemo } from "react";
import { DashboardCustomizationConst } from "../customizable-dashboard/types";
import type {
  WidgetFilterViewDefinition,
  WidgetViewDefinition,
} from "../customizable-dashboard/types";
import WidgetTopStatistics from "../components/widgets/top-statistics";
import WidgetHostTopStatistics from "../components/widgets/host-top-statistics";
import FilterDateRangePicker from "../components/filters/filter-date-range-picker";
import WidgetDailySales from "../components/widgets/daily-sales";
import WidgetProfitShare from "../components/widgets/profit-share";
import WidgetMemberActivity from "../components/widgets/member-activity";
import WidgetRegionalStatistics from "../components/widgets/regional-statistics";
import WidgetSalesSummary from "../components/widgets/sales-summary";
import WidgetGeneralStatistics from "../components/widgets/general-statistics";
import WidgetIncomeStatistics from "../components/widgets/income-statistics";
import WidgetEditionStatistics from "../components/widgets/edition-statistics";
import WidgetRecentTenants from "../components/widgets/recent-tenants";
import WidgetSubscriptionExpiringTenants from "../components/widgets/subscription-expiring-tenants";

export interface DashboardViewConfigurationService {
  WidgetViewDefinitions: WidgetViewDefinition[];
  widgetFilterDefinitions: WidgetFilterViewDefinition[];
}

export function useDashboardConfiguration(): DashboardViewConfigurationService {
  return useMemo(() => {
    const widgetFilterDefinitions: WidgetFilterViewDefinition[] = [
      {
        id: DashboardCustomizationConst.filters.filterDateRangePicker,
        component: FilterDateRangePicker,
      },
    ];

    const WidgetViewDefinitions: WidgetViewDefinition[] = [
      {
        id: DashboardCustomizationConst.widgets.tenant.topStats,
        component: WidgetTopStatistics,
        defaultWidth: 12,
        defaultHeight: 5,
      },
      {
        id: DashboardCustomizationConst.widgets.host.topStats,
        component: WidgetHostTopStatistics,
        defaultWidth: 12,
        defaultHeight: 5,
      },
      {
        id: DashboardCustomizationConst.widgets.tenant.dailySales,
        component: WidgetDailySales,
        defaultWidth: 6,
        defaultHeight: 8,
      },
      {
        id: DashboardCustomizationConst.widgets.tenant.profitShare,
        component: WidgetProfitShare,
        defaultWidth: 6,
        defaultHeight: 11,
      },
      {
        id: DashboardCustomizationConst.widgets.tenant.memberActivity,
        component: WidgetMemberActivity,
        defaultWidth: 6,
        defaultHeight: 11,
      },
      {
        id: DashboardCustomizationConst.widgets.tenant.regionalStats,
        component: WidgetRegionalStatistics,
        defaultWidth: 6,
        defaultHeight: 12,
      },
      {
        id: DashboardCustomizationConst.widgets.tenant.salesSummary,
        component: WidgetSalesSummary,
        defaultWidth: 6,
        defaultHeight: 12,
      },
      {
        id: DashboardCustomizationConst.widgets.tenant.generalStats,
        component: WidgetGeneralStatistics,
        defaultWidth: 6,
        defaultHeight: 8,
      },
      {
        id: DashboardCustomizationConst.widgets.host.incomeStatistics,
        component: WidgetIncomeStatistics,
        defaultWidth: 7,
        defaultHeight: 8,
      },
      {
        id: DashboardCustomizationConst.widgets.host.editionStatistics,
        component: WidgetEditionStatistics,
        defaultWidth: 5,
        defaultHeight: 8,
      },
      {
        id: DashboardCustomizationConst.widgets.host
          .subscriptionExpiringTenants,
        component: WidgetSubscriptionExpiringTenants,
        defaultWidth: 7,
        defaultHeight: 9,
      },
      {
        id: DashboardCustomizationConst.widgets.host.recentTenants,
        component: WidgetRecentTenants,
        defaultWidth: 5,
        defaultHeight: 9,
      },
    ];

    return { WidgetViewDefinitions, widgetFilterDefinitions };
  }, []);
}
