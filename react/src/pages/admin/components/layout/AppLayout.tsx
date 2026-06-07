import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutProvider,
  LayoutSplashScreen,
  PageDataProvider,
} from "metronic/app/partials/layout/core";
import { MasterInit } from "metronic/app/partials/layout/MasterInit";
import ThemedLayout from "./themes";
import { MetronicI18nProvider } from "metronic/app/i18n/Metronici18n";
import { I18nProvider } from "metronic/app/i18n/i18nProvider";
import { reInitMenu } from "metronic/app/helpers";
import { ChatProvider } from "./chat/ChatProvider";
import ChatBar from "./chat";
import UserDelegationsModal from "./user-delegations/UserDelegationsModal";
import ThemeSelectionPanel from "./theme-selection/ThemeSelectionPanel";
import SessionTimeoutModal from "../common/session-timeout/SessionTimeoutModal";
import { useSession } from "@/hooks/useSession";
import "./AppLayout.scss";

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { theme } = useSession();

  useEffect(() => {
    document.body.setAttribute("data-kt-app-layout", `light-sidebar`);
    document.body.setAttribute("data-kt-app-header-fixed", "true");
    document.body.setAttribute("data-kt-app-header-fixed-mobile", "true");
    document.body.setAttribute("data-kt-app-sidebar-enabled", "true");
    document.body.setAttribute("data-kt-app-sidebar-fixed", "true");
    document.body.setAttribute("data-kt-app-sidebar-hoverable", "true");
    document.body.setAttribute("data-kt-app-sidebar-push-header", "true");
    document.body.setAttribute("data-kt-app-toolbar-enabled", "true");
    document.body.setAttribute("data-kt-app-sidebar-push-toolbar", "true");
    document.body.setAttribute("data-kt-app-sidebar-push-footer", "true");

    const toolbarDesktopFixed =
      theme?.baseSettings?.toolbar?.desktopFixedToolbar ?? false;
    const toolbarMobileFixed =
      theme?.baseSettings?.toolbar?.mobileFixedToolbar ?? false;
    const footerDesktopFixed =
      theme?.baseSettings?.footer?.desktopFixedFooter ?? false;
    const footerMobileFixed =
      theme?.baseSettings?.footer?.mobileFixedFooter ?? false;

    document.body.setAttribute(
      "data-kt-app-toolbar-fixed",
      String(toolbarDesktopFixed),
    );
    document.body.setAttribute(
      "data-kt-app-toolbar-fixed-mobile",
      String(toolbarMobileFixed),
    );
    document.body.setAttribute(
      "data-kt-app-footer-fixed",
      String(footerDesktopFixed),
    );
    document.body.setAttribute(
      "data-kt-app-footer-fixed-mobile",
      String(footerMobileFixed),
    );

    reInitMenu();
  }, [location.key, theme]);

  return (
    <MetronicI18nProvider>
      <I18nProvider>
        <LayoutProvider>
          <PageDataProvider>
            <ChatProvider>
              <ThemedLayout />
              <SessionTimeoutModal />
              <UserDelegationsModal />
              <ThemeSelectionPanel />
              <ChatBar />
            </ChatProvider>
            <MasterInit />
            <LayoutSplashScreen />
          </PageDataProvider>
        </LayoutProvider>
      </I18nProvider>
    </MetronicI18nProvider>
  );
};

export { AppLayout };
export default AppLayout;
