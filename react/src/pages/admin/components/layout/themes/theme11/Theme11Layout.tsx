import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Theme11Brand from "./Theme11Brand";
import { Footer } from "../../Footer";
import { useTheme } from "@/hooks/useTheme";
import TopBar from "../../TopBar";
import { TopbarMenu } from "../../topbar/TopbarMenu";

const Theme11Layout: React.FC = () => {
  const { containerClass } = useTheme();

  useEffect(() => {
    document.body.classList.add(
      "header-fixed",
      "header-tablet-and-mobile-fixed",
      "toolbar-enabled",
    );
    return () => {
      document.body.classList.remove(
        "header-fixed",
        "header-tablet-and-mobile-fixed",
        "toolbar-enabled",
      );
    };
  }, []);

  return (
    <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
      <div className="page d-flex flex-row flex-column-fluid">
        <div
          className="wrapper d-flex flex-column flex-row-fluid"
          id="kt_wrapper"
        >
          <div
            id="kt_header"
            className="header"
            data-kt-sticky="true"
            data-kt-sticky-name="header"
            data-kt-sticky-offset="{default: '200px', lg: '300px'}"
            style={{ animationDuration: "0.3s" }}
          >
            <div className={`${containerClass} d-flex flex-grow-1 flex-stack`}>
              <div className="d-flex align-items-center me-5">
                <div
                  className="d-lg-none btn btn-icon btn-active-color-primary w-30px h-30px ms-n2 me-3"
                  id="kt_header_menu_toggle"
                >
                  <span className="svg-icon svg-icon-2">
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
                <Theme11Brand />
              </div>
              <TopBar
                className="d-flex align-items-center flex-shrink-0"
                buttonClassName="btn btn-icon btn-color-gray-700 btn-active-color-primary btn-outline btn-active-bg-light w-30px h-30px w-lg-40px h-lg-40px position-relative"
                userMenuTogglerClassName="symbol symbol-40px cursor-pointer"
              />
            </div>
            <div className="separator" />
            <div
              className={`header-menu-container ${containerClass} d-flex flex-stack h-lg-75px w-100`}
              id="kt_header_nav"
            >
              <div
                className="header-menu flex-column flex-lg-row"
                data-kt-drawer="true"
                data-kt-drawer-name="header-menu"
                data-kt-drawer-activate="{default: true, lg: false}"
                data-kt-drawer-overlay="true"
                data-kt-drawer-width="{default:'200px', '300px': '250px'}"
                data-kt-drawer-direction="start"
                data-kt-drawer-toggle="#kt_header_menu_toggle"
                data-kt-swapper="true"
                data-kt-swapper-mode="prepend"
                data-kt-swapper-parent="{default: '#kt_app_body', lg: '#kt_header_nav'}"
              >
                <TopbarMenu />
                <div className="flex-shrink-0 p-4 p-lg-0 me-lg-2" />
              </div>
            </div>
          </div>
          <div className="d-flex flex-column flex-column-fluid">
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Theme11Layout;
