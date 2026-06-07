import React from "react";
import clsx from "clsx";
import SubscriptionNotificationBar from "./topbar/SubscriptionNotificationBar";
import QuickThemeSelection from "./topbar/QuickThemeSelection";
import ChatToggleButton from "./topbar/ChatToggleButton";
import UserMenu from "./topbar/UserMenu";
import LanguageSwitch from "./topbar/LanguageSwitch";
import HeaderNotifications from "./topbar/HeaderNotifications";
import ToogleDarkMode from "./toggle-dark-mode/ToogleDarkMode";
import DelegatedUsersDropdown from "./topbar/DelegatedUsersDropdown";

type TopBarProps = {
  className?: string;
  buttonClassName?: string;
  userMenuIconOnly?: boolean;
  userMenuTogglerClassName?: string;
  profileImageClassName?: string;
  right?: boolean;
};

const TopBar: React.FC<TopBarProps> = ({
  className,
  buttonClassName,
  userMenuIconOnly = false,
  userMenuTogglerClassName,
  profileImageClassName,
  right = true,
}) => {
  return (
    <>
      <div className={clsx("app-navbar flex-shrink-0 topbar", className)}>
        <DelegatedUsersDropdown buttonClassName={buttonClassName} />

        <SubscriptionNotificationBar />

        {abp?.setting?.getBoolean?.(
          "App.UserManagement.IsQuickThemeSelectEnabled",
        ) && <QuickThemeSelection className={buttonClassName} />}

        <LanguageSwitch buttonClassName={buttonClassName} right={right} />

        <div className={clsx("d-flex align-items-center ms-1 ms-lg-3")}>
          <HeaderNotifications customStyle={buttonClassName} right={right} />
        </div>

        <ChatToggleButton buttonClassName={buttonClassName} />

        <ToogleDarkMode customStyle={buttonClassName} right={right} />

        <UserMenu
          iconOnly={userMenuIconOnly}
          togglerClassName={userMenuTogglerClassName || buttonClassName}
          profileImageClassName={profileImageClassName}
          right={right}
        />
      </div>
    </>
  );
};

export default TopBar;
