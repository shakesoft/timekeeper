import React from "react";
import clsx from "clsx";
import { useLocation } from "react-router";
import { useLayout } from "metronic/app/partials/layout/core";
import { checkIsActive, KTIcon, WithChildren } from "metronic/app/helpers";
import { hasActiveChild } from "@/lib/router-helper";

type Props = {
  to: string;
  title: string;
  icon?: string;
  fontIcon?: string;
  hasBullet?: boolean;
  iconMenu?: boolean;
  isTopLevel?: boolean;
};

const SidebarMenuItemWithSub: React.FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  hasBullet,
  iconMenu = false,
  isTopLevel = false,
}) => {
  const { pathname } = useLocation();
  const isActive = checkIsActive(pathname, to);
  const hasActiveChildren = hasActiveChild(pathname, children);
  const isMenuItemActive = isActive || hasActiveChildren;
  const { config } = useLayout();
  const { app } = config;

  const menuTrigger =
    iconMenu && isTopLevel ? "{default: 'click', lg: 'hover'}" : "click";

  const menuItemClass =
    iconMenu && isTopLevel ? "menu-dropdown" : "menu-accordion";
  const menuSubClass =
    iconMenu && isTopLevel
      ? "menu-sub-dropdown px-1 py-4"
      : "menu-sub-accordion";

  const tooltipProps =
    iconMenu && isTopLevel
      ? {
          "data-bs-toggle": "tooltip",
          "data-bs-placement": "right",
          "data-bs-trigger": "hover",
          title: title,
        }
      : {};

  return (
    <div
      className={clsx(
        "menu-item",
        { "here show": !iconMenu && isMenuItemActive },
        menuItemClass,
        iconMenu && isTopLevel && "pb-3",
      )}
      data-kt-menu-trigger={menuTrigger}
      {...(isTopLevel ? { "data-kt-menu-placement": "right-start" } : {})}
    >
      <span
        className={clsx("menu-link", { active: isMenuItemActive })}
        {...tooltipProps}
      >
        {hasBullet && (
          <span className="menu-bullet">
            <span className="bullet bullet-dot"></span>
          </span>
        )}
        {icon && app?.sidebar?.default?.menu?.iconType === "svg" && (
          <span
            className={clsx("menu-icon", iconMenu && isTopLevel && "m-auto")}
          >
            <KTIcon iconName={icon} className="fs-2" />
          </span>
        )}
        {fontIcon && app?.sidebar?.default?.menu?.iconType === "font" && (
          <i className={clsx("bi fs-3", fontIcon)}></i>
        )}
        {!iconMenu && <span className="menu-title">{title}</span>}
        {!iconMenu && <span className="menu-arrow"></span>}
      </span>
      <div
        className={clsx("menu-sub", menuSubClass, {
          "menu-active-bg": isMenuItemActive,
        })}
      >
        <div className="menu-subnav">
          {iconMenu && isTopLevel && (
            <div className="menu-item">
              <div className="menu-content">
                <span className="menu-section fs-5 fw-bolder ps-1 py-1">
                  {title}
                </span>
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export { SidebarMenuItemWithSub };
