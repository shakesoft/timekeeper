import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Theme3Brand from "./Theme3Brand";
import { SidebarMenuMain } from "../../sidebar-menu/SidebarMenuMain";
import { Footer } from "../../Footer";
import { useTheme } from "@/hooks/useTheme";
import TopBar from "../../TopBar";
import { reInitMenu } from "metronic/app/helpers";

const Theme3Layout: React.FC = () => {
  const { containerClass } = useTheme();

  const theme3BtnClass =
    "btn btn-icon btn-color-gray-700 btn-active-color-primary btn-outline w-40px h-40px position-relative";

  useEffect(() => {
    reInitMenu();
  }, []);

  return (
    <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
      <div className="page d-flex flex-row flex-column-fluid">
        {/* Aside */}
        <div
          id="kt_aside"
          className="aside py-9"
          data-kt-drawer="true"
          data-kt-drawer-name="aside"
          data-kt-drawer-activate="{default: true, lg: false}"
          data-kt-drawer-overlay="true"
          data-kt-drawer-width="{default:'200px', '300px': '250px'}"
          data-kt-drawer-direction="start"
          data-kt-drawer-toggle="#kt_aside_toggle"
        >
          <div
            className="aside-logo flex-column-auto px-9 mb-9"
            id="kt_aside_logo"
          >
            <Theme3Brand />
          </div>
          <div
            className="aside-menu flex-column-fluid ps-5 pe-3 mb-9"
            id="kt_aside_menu"
          >
            <div
              className="w-100 hover-scroll-overlay-y d-flex pe-2"
              id="kt_aside_menu_wrapper"
              data-kt-scroll="true"
              data-kt-scroll-activate="{default: false, lg: false}"
              data-kt-scroll-height="auto"
              data-kt-scroll-dependencies="#kt_aside_logo, #kt_aside_footer"
              data-kt-scroll-wrappers="#kt_aside, #kt_aside_menu, #kt_aside_menu_wrapper"
              data-kt-scroll-offset="100"
            >
              <div
                className="menu menu-column menu-rounded menu-sub-indention px-3"
                data-kt-menu="true"
                data-kt-menu-expand="false"
              >
                <SidebarMenuMain />
              </div>
            </div>
          </div>
        </div>

        {/* Wrapper */}
        <div
          className="wrapper d-flex flex-column flex-row-fluid"
          id="kt_wrapper"
        >
          {/* Header */}
          <div id="kt_header" className="header">
            <div
              className={`${containerClass} d-flex align-items-center justify-content-between`}
              id="kt_header_container"
            >
              <div className="page-title d-flex flex-column align-items-start justify-content-center flex-wrap me-lg-2 pb-5 pb-lg-0" />
              <div className="d-flex d-lg-none align-items-center ms-n2 me-2">
                <div
                  className="btn btn-icon btn-active-icon-primary"
                  id="kt_aside_toggle"
                >
                  <span className="svg-icon svg-icon-1 mt-1">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 7H3C2.4 7 2 6.6 2 6V4C2 3.4 2.4 3 3 3H21C21.6 3 22 3.4 22 4V6C22 6.6 21.6 7 21 7Z"
                        fill="currentColor"
                      />
                      <path
                        opacity="0.3"
                        d="M21 14H3C2.4 14 2 13.6 2 13V11C2 10.4 2.4 10 3 10H21C21.6 10 22 10.4 22 11V13C22 13.6 21.6 14 21 14ZM22 20V18C22 17.4 21.6 17 21 17H3C2.4 17 2 17.4 2 18V20C2 20.6 2.4 21 3 21H21C21.6 21 22 20.6 22 20Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                </div>
                <Theme3Brand logoSize="sm" />
              </div>
              <TopBar
                className="d-flex align-items-center flex-shrink-0"
                buttonClassName={theme3BtnClass}
                userMenuIconOnly={true}
              />
            </div>
          </div>

          {/* Content */}
          <div className="d-flex flex-column flex-column-fluid">
            <Outlet />
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Theme3Layout;
