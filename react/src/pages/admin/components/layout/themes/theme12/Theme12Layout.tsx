import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Theme12Brand from "./Theme12Brand";
import { Footer } from "../../Footer";
import { useTheme } from "@/hooks/useTheme";
import TopBar from "../../TopBar";
import { TopbarMenu } from "../../topbar/TopbarMenu";

const Theme12Layout: React.FC = () => {
  const { containerClass } = useTheme();

  useEffect(() => {
    document.body.classList.add(
      "page-bg",
      "header-fixed",
      "header-tablet-and-mobile-fixed",
      "aside-enabled",
    );
    return () => {
      document.body.classList.remove(
        "page-bg",
        "header-fixed",
        "header-tablet-and-mobile-fixed",
        "aside-enabled",
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
            className="header align-items-stretch"
            data-kt-sticky="true"
            data-kt-sticky-name="header"
            data-kt-sticky-offset="{default: '200px', lg: '300px'}"
          >
            <div
              className={`${containerClass} header-container d-flex align-items-center`}
            >
              <div
                className="d-flex topbar align-items-center d-lg-none ms-n2 me-3"
                title="Show aside menu"
              >
                <div
                  className="btn btn-icon btn-color-gray-900 w-30px h-30px"
                  id="kt_header_menu_mobile_toggle"
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
              </div>
              <div className="header-logo me-5 me-md-10 flex-grow-1 flex-lg-grow-0">
                <Theme12Brand />
              </div>
              <div className="d-flex align-items-stretch justify-content-end flex-lg-grow-1">
                <div className="d-flex align-items-stretch" id="kt_header_nav">
                  <div
                    className="header-menu align-items-stretch h-lg-75px"
                    data-kt-drawer="true"
                    data-kt-drawer-name="header-menu"
                    data-kt-drawer-activate="{default: true, lg: false}"
                    data-kt-drawer-overlay="true"
                    data-kt-drawer-width="{default:'200px', '300px': '250px'}"
                    data-kt-drawer-direction="start"
                    data-kt-drawer-toggle="#kt_header_menu_mobile_toggle"
                    data-kt-swapper="true"
                    data-kt-swapper-mode="prepend"
                    data-kt-swapper-parent="{default: '#kt_body', lg: '#kt_header_nav'}"
                  >
                    <TopbarMenu />
                  </div>
                </div>
                <div className="d-flex align-items-stretch flex-shrink-0">
                  <TopBar
                    className="topbar d-flex align-items-stretch flex-shrink-0"
                    buttonClassName="btn btn-icon btn-topbar w-30px h-30px w-md-40px h-md-40px position-relative"
                    userMenuTogglerClassName="btn btn-icon w-30px h-30px w-md-40px h-md-40px"
                    profileImageClassName="h-100 w-100 rounded"
                  />
                </div>
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

export default Theme12Layout;
