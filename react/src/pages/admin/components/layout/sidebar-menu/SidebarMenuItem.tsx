import { FC } from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useLocation } from "react-router";
import { useLayout } from "metronic/app/partials/layout/core";
import { checkIsActive, KTIcon, WithChildren } from "metronic/app/helpers";

type Props = {
  to: string;
  title: string;
  icon?: string;
  fontIcon?: string;
  hasBullet?: boolean;
  iconMenu?: boolean;
};

const SidebarMenuItem: FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  fontIcon,
  hasBullet = false,
  iconMenu = false,
}) => {
  const { pathname } = useLocation();
  const isActive = checkIsActive(pathname, to);
  const { config } = useLayout();
  const { app } = config;

  const tooltipProps = iconMenu
    ? {
        "data-bs-toggle": "tooltip",
        "data-bs-placement": "right",
        "data-bs-trigger": "hover",
        title: title,
      }
    : {};

  return (
    <div className="menu-item">
      <Link
        className={clsx("menu-link without-sub", { active: isActive })}
        to={to}
        {...tooltipProps}
      >
        {hasBullet && (
          <span className="menu-bullet">
            <span className="bullet bullet-dot"></span>
          </span>
        )}
        {icon && app?.sidebar?.default?.menu?.iconType === "svg" && (
          <span className={clsx("menu-icon", iconMenu && "m-auto")}>
            {" "}
            <KTIcon iconName={icon} className="fs-2" />
          </span>
        )}
        {fontIcon && app?.sidebar?.default?.menu?.iconType === "font" && (
          <i className={clsx("bi fs-3", fontIcon)}></i>
        )}
        {!iconMenu && <span className="menu-title">{title}</span>}
      </Link>
      {children}
    </div>
  );
};

export { SidebarMenuItem };
