import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Theme6Brand from "./Theme6Brand";
import { SidebarMenu } from "../../sidebar-menu/SidebarMenu";
import { Footer } from "../../Footer";
import { useTheme } from "@/hooks/useTheme";
import TopBar from "../../TopBar";

const Theme6Layout: React.FC = () => {
  const { containerClass } = useTheme();

  useEffect(() => {
    document.body.classList.add(
      "header-fixed",
      "header-tablet-and-mobile-fixed",
      "toolbar-enabled",
      "toolbar-fixed",
      "aside-enabled",
      "aside-fixed",
    );
    return () => {
      document.body.classList.remove(
        "header-fixed",
        "header-tablet-and-mobile-fixed",
        "toolbar-enabled",
        "toolbar-fixed",
        "aside-enabled",
        "aside-fixed",
      );
    };
  }, []);

  return (
    <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
      <div className="page d-flex flex-row flex-column-fluid">
        {/* Aside */}
        <div
          id="kt_aside"
          className="aside pb-5 pt-5 pt-lg-0"
          data-kt-drawer="true"
          data-kt-drawer-name="aside"
          data-kt-drawer-activate="{default: true, lg: false}"
          data-kt-drawer-overlay="true"
          data-kt-drawer-width="{default:'140px', '300px': '140px'}"
          data-kt-drawer-direction="start"
          data-kt-drawer-toggle="#kt_aside_mobile_toggle"
        >
          <div className="aside-logo py-8" id="kt_aside_logo">
            <Theme6Brand />
          </div>
          <div className="aside-menu flex-column-fluid" id="kt_aside_menu">
            <SidebarMenu
              iconMenu={true}
              menuClass="menu menu-column menu-title-gray-700 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500 fw-semibold"
            />
          </div>
        </div>

        {/* Wrapper */}
        <div
          className="wrapper d-flex flex-column flex-row-fluid"
          id="kt_wrapper"
        >
          <div id="kt_header" className="header align-items-stretch">
            <div
              className={`${containerClass} d-flex align-items-stretch justify-content-between`}
            >
              {/* Aside mobile toggle */}
              <div
                className="d-flex align-items-center d-lg-none ms-n3 me-1"
                title="Show aside menu"
              >
                <div
                  className="btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px"
                  id="kt_aside_mobile_toggle"
                >
                  <span className="svg-icon svg-icon-2x mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M21 7H3C2.4 7 2 6.6 2 6V4C2 3.4 2.4 3 3 3H21C21.6 3 22 3.4 22 4V6C22 6.6 21.6 7 21 7Z"
                        fill="black"
                      />
                      <path
                        opacity="0.3"
                        d="M21 14H3C2.4 14 2 13.6 2 13V11C2 10.4 2.4 10 3 10H21C21.6 10 22 10.4 22 11V13C22 13.6 21.6 14 21 14ZM22 20V18C22 17.4 21.6 17 21 17H3C2.4 17 2 17.4 2 18V20C2 20.6 2.4 21 3 21H21C21.6 21 22 20.6 22 20Z"
                        fill="black"
                      />
                    </svg>
                  </span>
                </div>
              </div>
              {/* Mobile brand */}
              <div className="d-lg-none d-flex align-items-center flex-grow-1 flex-lg-grow-0">
                <a href="/" className="d-flex align-items-center">
                  <Theme6Brand imageClass="h-30px" />
                </a>
              </div>
              <div className="d-flex align-items-stretch justify-content-between flex-lg-grow-1">
                <div
                  className="d-flex align-items-stretch"
                  id="kt_header_nav"
                />
                {/* Topbar */}
                <div className="d-flex align-items-stretch flex-shrink-0">
                  <TopBar
                    className="d-flex align-items-stretch flex-shrink-0"
                    buttonClassName="btn btn-icon btn-active-light-primary position-relative w-30px h-30px w-md-40px h-md-40px"
                    userMenuIconOnly={false}
                    userMenuTogglerClassName="cursor-pointer symbol symbol-30px symbol-md-40px"
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            className="content d-flex flex-column flex-column-fluid pt-5"
            id="kt_content"
          >
            <div id="kt_content_container" className={containerClass}>
              <Outlet />
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Theme6Layout;
