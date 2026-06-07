import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Theme9Brand from "./Theme9Brand";
import { Footer } from "../../Footer";
import { useTheme } from "@/hooks/useTheme";
import { SidebarMenu } from "../../sidebar-menu/SidebarMenu";
import TopBar from "../../TopBar";

const Theme9Layout: React.FC = () => {
  const { containerClass } = useTheme();

  useEffect(() => {
    document.body.classList.add(
      "header-fixed",
      "header-tablet-and-mobile-fixed",
      "aside-fixed",
      "aside-secondary-disabled",
    );

    const asideElement = document.getElementById("kt_aside");
    if (asideElement) {
      asideElement.setAttribute("data-kt-drawer-width", "140px");
    }

    return () => {
      document.body.classList.remove(
        "header-fixed",
        "header-tablet-and-mobile-fixed",
        "aside-fixed",
        "aside-secondary-disabled",
      );
    };
  }, []);

  return (
    <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
      <div className="page d-flex flex-row flex-column-fluid">
        {/* Aside */}
        <div
          id="kt_aside"
          className="aside"
          data-kt-drawer="true"
          data-kt-drawer-name="aside"
          data-kt-drawer-activate="{default: true, lg: false}"
          data-kt-drawer-overlay="true"
          data-kt-drawer-width="auto"
          data-kt-drawer-direction="start"
          data-kt-drawer-toggle="#kt_aside_toggle"
        >
          <div
            className="aside-logo flex-column-auto pt-10 pt-lg-20"
            id="kt_aside_logo"
          >
            <Theme9Brand />
          </div>
          <div
            className="aside-menu flex-column-fluid pt-0 pb-7 py-lg-10"
            id="kt_aside_menu"
          >
            <SidebarMenu
              iconMenu={true}
              menuClass="menu menu-column menu-title-gray-600 menu-state-primary menu-state-icon-primary menu-state-bullet-primary menu-icon-gray-400 menu-arrow-gray-400 fw-semibold fs-6 my-auto"
            />
          </div>
        </div>

        {/* Wrapper */}
        <div
          className="wrapper d-flex flex-column flex-row-fluid"
          id="kt_wrapper"
        >
          {/* Header mobile */}
          <div className="header-mobile py-3">
            <div className="container d-flex flex-stack">
              <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
                <Theme9Brand imageClass="h-35px" />
              </div>
              <button
                className="btn btn-icon btn-active-color-primary"
                id="kt_aside_toggle"
              >
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
              </button>
            </div>
          </div>

          {/* Header */}
          <div
            id="kt_header"
            className="header py-6 py-lg-0"
            data-kt-sticky="true"
            data-kt-sticky-name="header"
            data-kt-sticky-offset="{lg: '300px'}"
            style={{ animationDuration: "0.3s" }}
          >
            <div className={`header-container ${containerClass}`}>
              <div className="page-title d-flex flex-column align-items-start justify-content-center flex-wrap me-lg-20 py-3 py-lg-0 me-3" />
              <div className="d-flex align-items-center flex-wrap">
                <TopBar
                  className="d-flex align-items-center py-3 py-lg-0"
                  buttonClassName="btn btn-icon btn-custom btn-active-color-primary position-relative"
                  userMenuTogglerClassName="symbol symbol-50px cursor-pointer"
                  right={false}
                />
              </div>
            </div>
            <div className="header-offset" />
          </div>

          {/* Content */}
          <div
            className="content d-flex flex-column flex-column-fluid"
            id="kt_content"
          >
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Theme9Layout;
