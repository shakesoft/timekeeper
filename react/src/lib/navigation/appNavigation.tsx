import { useMemo } from "react";
import { usePermissions } from "../../hooks/usePermissions";
import { useSession } from "../../hooks/useSession";
import L from "../L";

export interface AppMenuItem {
  id: string;
  title: string;
  permissionName?: string;
  icon?: string;
  fontIcon?: string;
  route?: string;
  routeTemplates?: string[];
  children?: AppMenuItem[];
  external?: boolean;
  parameters?: Record<string, unknown>;
  requiresAuthentication?: boolean;
  featureDependency?: () => boolean;
}

export const buildRawMenu = (): AppMenuItem[] => [
  {
    id: "DashboardHost",
    title: L("Dashboard"),
    permissionName: "Pages.Administration.Host.Dashboard",
    icon: "element-11",
    route: "/app/host-dashboard",
  },
  {
    id: "DashboardTenant",
    title: L("Dashboard"),
    permissionName: "Pages.Tenant.Dashboard",
    icon: "element-11",
    route: "/app/tenant-dashboard",
  },
  {
    id: "Saas",
    title: L("Saas"),
    icon: "cloud",
    children: [
      {
        id: "Tenants",
        title: L("Tenants"),
        permissionName: "Pages.Tenants",
        icon: "abstract-14",
        route: "/app/admin/tenants",
      },
      {
        id: "Editions",
        title: L("Editions"),
        permissionName: "Pages.Editions",
        icon: "category",
        route: "/app/admin/editions",
      },
    ],
  },
  {
    id: "Administration",
    title: L("Administration"),
    icon: "setting-4",
    children: [
      {
        id: "OrganizationUnits",
        title: L("Organization Units"),
        permissionName: "Pages.Administration.OrganizationUnits",
        icon: "data",
        route: "/app/admin/organization-units",
      },
      {
        id: "Roles",
        title: L("Roles"),
        permissionName: "Pages.Administration.Roles",
        icon: "briefcase",
        route: "/app/admin/roles",
      },
      {
        id: "Users",
        title: L("Users"),
        permissionName: "Pages.Administration.Users",
        icon: "profile-user",
        route: "/app/admin/users",
      },
      {
        id: "Languages",
        title: L("Languages"),
        permissionName: "Pages.Administration.Languages",
        icon: "flag",
        route: "/app/admin/languages",
      },
      {
        id: "AuditLogs",
        title: L("AuditLogs"),
        permissionName: "Pages.Administration.AuditLogs",
        icon: "folder",
        route: "/app/admin/audit-logs",
      },
      {
        id: "Maintenance",
        title: L("Maintenance"),
        permissionName: "Pages.Administration.Host.Maintenance",
        icon: "wrench",
        route: "/app/admin/maintenance",
      },
      {
        id: "Subscription",
        title: L("Subscription"),
        permissionName: "Pages.Administration.Tenant.SubscriptionManagement",
        icon: "credit-cart",
        route: "/app/admin/subscription-management",
      },
      {
        id: "VisualSettings",
        title: L("VisualSettings"),
        permissionName: "Pages.Administration.UiCustomization",
        icon: "brush",
        route: "/app/admin/ui-customization",
      },
      {
        id: "WebhookSubscriptions",
        title: L("WebhookSubscriptions"),
        permissionName: "Pages.Administration.WebhookSubscription",
        icon: "fasten",
        route: "/app/admin/webhook-subscriptions",
      },
      {
        id: "DynamicProperties",
        title: L("DynamicProperties"),
        permissionName: "Pages.Administration.DynamicProperties",
        icon: "setting-3",
        route: "/app/admin/dynamic-property",
      },
      {
        id: "Notifications",
        title: L("Notifications"),
        icon: "notification",
        children: [
          {
            id: "Inbox",
            title: L("Inbox"),
            icon: "message-text-2",
            route: "/app/notifications",
          },
          {
            id: "MassNotifications",
            title: L("MassNotifications"),
            permissionName: "Pages.Administration.MassNotification",
            icon: "notification-status",
            route: "/app/admin/mass-notifications",
          },
        ],
      },
      {
        id: "SettingsHost",
        title: L("Settings"),
        permissionName: "Pages.Administration.Host.Settings",
        icon: "gear",
        route: "/app/admin/settings/host",
      },
      {
        id: "SettingsTenant",
        title: L("Settings"),
        permissionName: "Pages.Administration.Tenant.Settings",
        icon: "gear",
        route: "/app/admin/settings/tenant",
      },
      {
        id: "ActiveSessions",
        title: L("ActiveSessions"),
        permissionName: "Pages.Administration.ActiveSessions",
        icon: "security-check",
        route: "/app/admin/active-sessions",
        featureDependency: () =>
          !!abp?.setting?.getBoolean?.(
            "App.UserManagement.SessionManagement.IsEnabled",
          ),
      },
    ],
  },
  {
    id: "DemoUiComponents",
    title: L("DemoUiComponents"),
    permissionName: "Pages.DemoUiComponents",
    icon: "element-1",
    route: "/app/admin/demo-ui-components",
  },
];

const flatten = (items: AppMenuItem[]): AppMenuItem[] =>
  items.flatMap((i) => [i, ...(i.children ? flatten(i.children) : [])]);

const filterMenu = (
  items: AppMenuItem[],
  ctx: {
    isGranted: (p: string) => boolean;
    tenant: { edition?: unknown } | null | undefined;
  },
): AppMenuItem[] => {
  const res: AppMenuItem[] = [];
  for (const item of items) {
    let hide = false;
    if (item.permissionName && !ctx.isGranted(item.permissionName)) hide = true;
    if (
      item.permissionName ===
        "Pages.Administration.Tenant.SubscriptionManagement" &&
      ctx.tenant &&
      !ctx.tenant.edition
    )
      hide = true;
    if (item.featureDependency && !item.featureDependency()) hide = true;
    let children: AppMenuItem[] | undefined;
    if (!hide && item.children?.length) {
      children = filterMenu(item.children, ctx);
      if (!children.length) hide = true;
    }
    if (!hide) res.push({ ...item, children });
  }
  return res;
};

export const canShowMenuItem = (
  item: AppMenuItem,
  opts: {
    isGranted: (p: string) => boolean;
    tenant: { edition?: unknown } | null | undefined;
    user: unknown;
  },
) => {
  if (
    item.permissionName ===
      "Pages.Administration.Tenant.SubscriptionManagement" &&
    opts.tenant &&
    !opts.tenant.edition
  )
    return false;
  if (item.requiresAuthentication && !opts.user) return false;
  if (item.permissionName && !opts.isGranted(item.permissionName)) return false;
  if (item.featureDependency && !item.featureDependency()) return false;
  return true;
};

export const useAppMenu = () => {
  const { isGranted } = usePermissions();
  const { tenant } = useSession();
  const filtered = useMemo(
    () => filterMenu(buildRawMenu(), { isGranted, tenant }),
    [isGranted, tenant],
  );
  return filtered;
};

export const useAllMenuItems = () => {
  const menu = useAppMenu();
  return useMemo(() => flatten(menu), [menu]);
};

export const useMenuSearchSource = () => {
  const all = useAllMenuItems();
  return useMemo(
    () =>
      all
        .filter((i) => i.route)
        .map((i) => ({
          id: i.id,
          name: i.title,
          route: i.route,
          external: i.external,
          parameters: i.parameters,
        })),
    [all],
  );
};
