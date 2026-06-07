import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Theme10Brand from "./Theme10Brand";
import { Footer } from "../../Footer";
import TopBar from "../../TopBar";
import { SidebarMenu } from "../../sidebar-menu/SidebarMenu";

const Theme10Layout: React.FC = () => {
  useEffect(() => {
    document.body.classList.add(
      "header-tablet-and-mobile-fixed",
      "aside-enabled",
    );

    return () => {
      document.body.classList.remove(
        "header-tablet-and-mobile-fixed",
        "aside-enabled",
      );
    };
  }, []);

  return (
    <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
      <div className="page d-flex flex-row flex-column-fluid">
        {/* Sidebar */}
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
            className="aside-menu flex-column-fluid ps-5 pe-3 mb-7"
            id="kt_aside_menu"
          >
            <div
              className="w-100 hover-scroll-overlay-y d-flex pe-2"
              id="kt_aside_menu_wrapper"
              data-kt-scroll="true"
              data-kt-scroll-activate="{default: false, lg: true}"
              data-kt-scroll-height="auto"
              data-kt-scroll-dependencies="#kt_aside_footer, #kt_header"
              data-kt-scroll-wrappers="#kt_aside, #kt_aside_menu, #kt_aside_menu_wrapper"
              data-kt-scroll-offset="102"
            >
              <div
                className="menu menu-column menu-rounded menu-sub-indention menu-active-bg fw-semibold my-auto"
                id="kt_aside_menu_items"
                data-kt-menu="true"
              >
                <SidebarMenu />
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
          <div id="kt_header" className="header header-bg">
            <div className="container-fluid d-flex align-items-stretch justify-content-between">
              <div className="header-brand me-5 d-flex align-items-center">
                <div
                  className="d-flex align-items-center d-lg-none ms-n2 me-2"
                  title="Show aside menu"
                >
                  <div
                    className="btn btn-icon btn-color-white btn-active-color-primary w-30px h-30px"
                    id="kt_aside_toggle"
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
                </div>
                <Theme10Brand />
              </div>
              <TopBar
                className="d-flex align-items-stretch flex-shrink-0"
                buttonClassName="btn btn-icon btn-borderless btn-active-primary bg-white bg-opacity-10 position-relative"
                userMenuTogglerClassName="symbol symbol-40px cursor-pointer"
              />
            </div>
          </div>

          {/* Content */}
          <div
            className="content d-flex flex-column flex-column-fluid"
            id="kt_content"
          >
            <Outlet />
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Theme10Layout;
