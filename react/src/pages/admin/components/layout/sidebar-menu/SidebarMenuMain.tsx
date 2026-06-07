import type { JSX } from "react";
import { SidebarMenuItemWithSub } from "./SidebarMenuItemWithSub";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { useAppMenu, type AppMenuItem } from "@/lib/navigation/appNavigation";

interface SidebarMenuMainProps {
  iconMenu?: boolean;
}

const SidebarMenuMain = ({ iconMenu = false }: SidebarMenuMainProps) => {
  const menu = useAppMenu();

  const renderItem = (
    item: AppMenuItem,
    parentItem: AppMenuItem | null = null,
  ): JSX.Element => {
    if (item.children && item.children.length) {
      const isTopLevel = parentItem === null;
      const useIconMenuMode = iconMenu && isTopLevel;

      return (
        <SidebarMenuItemWithSub
          key={item.id}
          to={item.route || "#"}
          title={item.title}
          icon={item.icon}
          iconMenu={useIconMenuMode}
          isTopLevel={isTopLevel}
        >
          {item.children.map((c) => renderItem(c, item))}
        </SidebarMenuItemWithSub>
      );
    }
    if (!item.route) {
      return (
        <div key={item.id} className="menu-item">
          <span className="menu-link">
            <span className="menu-title">{item.title}</span>
          </span>
        </div>
      );
    }
    return (
      <SidebarMenuItem
        key={item.id}
        to={item.route}
        title={item.title}
        icon={item.icon}
        iconMenu={iconMenu && parentItem === null}
      />
    );
  };

  return <>{menu.map((m) => renderItem(m, null))}</>;
};

export { SidebarMenuMain };
