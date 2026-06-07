import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Theme5Brand from "./Theme5Brand";
import { Footer } from "../../Footer";
import { SidebarMenu } from "../../sidebar-menu/SidebarMenu";
import { useTheme } from "@/hooks/useTheme";
import TopBar from "../../TopBar";

const Theme5Layout: React.FC = () => {
  const { containerClass } = useTheme();

  useEffect(() => {
    document.body.classList.add(
      "header-fixed",
      "header-tablet-and-mobile-fixed",
      "aside-enabled",
      "sidebar-enabled",
    );
    return () => {
      document.body.classList.remove(
        "header-fixed",
        "header-tablet-and-mobile-fixed",
        "aside-enabled",
        "sidebar-enabled",
      );
    };
  }, []);

  return (
    <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
      <div className="page d-flex flex-column flex-column-fluid">
        {/* Header */}
        <div id="kt_header" className="header align-items-stretch">
          <div
            className={`${containerClass} d-flex align-items-stretch justify-content-between`}
          >
            <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0 w-lg-225px me-5">
              {/* Mobile aside toggle */}
              <div
                className="btn btn-icon btn-active-icon-primary ms-n2 me-2 d-flex d-lg-none"
                id="kt_aside_mobile_toggle"
              >
                <span className="svg-icon svg-icon-1">
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
              <Theme5Brand />
            </div>
            <div className="topbar d-flex align-items-stretch flex-shrink-0">
              <TopBar
                className="d-flex align-items-stretch flex-shrink-0"
                buttonClassName="btn btn-icon btn-active-light btn-active-color-primary w-30px h-30px w-md-40px h-md-40px position-relative"
                userMenuIconOnly={false}
                userMenuTogglerClassName="btn btn-active-light d-flex align-items-center bg-hover-light py-2 px-2 px-md-3 symbol symbol-30px symbol-md-40px"
              />
            </div>
          </div>
        </div>

        <div
          id="kt_content_container"
          className={`${containerClass} d-flex flex-column-fluid align-items-stretch`}
        >
          {/* Aside */}
          <div
            id="kt_aside"
            className="aside aside-light"
            data-kt-drawer="true"
            data-kt-drawer-name="aside"
            data-kt-drawer-activate="{default: true, lg: false}"
            data-kt-drawer-overlay="true"
            data-kt-drawer-width="{default:'200px', '300px': '250px'}"
            data-kt-drawer-direction="start"
            data-kt-drawer-toggle="#kt_aside_mobile_toggle"
          >
            <div className="hover-scroll-overlay-y my-5 my-lg-5 w-100 ps-4 ps-lg-0 pe-4 me-1">
              <SidebarMenu />
            </div>
          </div>

          {/* Wrapper */}
          <div
            className="wrapper d-flex flex-column flex-row-fluid mt-5 mt-lg-10"
            id="kt_wrapper"
          >
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
    </div>
  );
};

export default Theme5Layout;
