import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Theme7Brand from "./Theme7Brand";
import { Footer } from "../../Footer";
import { useTheme } from "@/hooks/useTheme";
import TopBar from "../../TopBar";
import { SidebarMenu } from "../../sidebar-menu/SidebarMenu";

const Theme7Layout: React.FC = () => {
  const { containerClass } = useTheme();

  useEffect(() => {
    document.body.classList.add(
      "header-fixed",
      "header-tablet-and-mobile-fixed",
      "aside-fixed",
      "aside-secondary-enabled",
    );
    return () => {
      document.body.classList.remove(
        "header-fixed",
        "header-tablet-and-mobile-fixed",
        "aside-fixed",
        "aside-secondary-enabled",
      );
    };
  }, []);

  return (
    <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
      <div className="page d-flex flex-row flex-column-fluid">
        {/* Aside */}
        <div
          id="kt_aside"
          className="aside aside-extended"
          data-kt-drawer="true"
          data-kt-drawer-name="aside"
          data-kt-drawer-activate="{default: true, lg: false}"
          data-kt-drawer-overlay="true"
          data-kt-drawer-width="auto"
          data-kt-drawer-direction="start"
          data-kt-drawer-toggle="#kt_aside_toggle"
        >
          <div className="aside-primary d-flex flex-column align-items-lg-center flex-row-auto">
            <div
              className="aside-logo d-none d-lg-flex flex-column align-items-center flex-column-auto py-10"
              id="kt_aside_logo"
            >
              <Theme7Brand />
            </div>
            <div
              className="aside-nav d-flex flex-column align-items-center flex-column-fluid w-100 pt-5 pt-lg-0"
              id="kt_aside_nav"
            >
              <div
                className="hover-scroll-overlay-y mb-5 px-5"
                data-kt-scroll="true"
                data-kt-scroll-activate="{default: false, lg: true}"
                data-kt-scroll-height="auto"
                data-kt-scroll-wrappers="#kt_aside_nav"
                data-kt-scroll-dependencies="#kt_aside_logo, #kt_aside_footer"
                data-kt-scroll-offset="0px"
                style={{ height: 343 }}
              >
                <ul
                  className="nav flex-column w-100"
                  id="kt_aside_nav_tabs"
                  role="tablist"
                />
              </div>
            </div>
            <div
              className="aside-footer d-flex flex-column align-items-center flex-column-auto"
              id="kt_aside_footer"
            >
              <TopBar
                className="d-flex flex-column align-items-center"
                buttonClassName="btn btn-icon btn-active-color-primary btn-color-gray-400 btn-active-light position-relative mb-3"
                userMenuIconOnly={false}
                userMenuTogglerClassName="cursor-pointer symbol symbol-40px"
                right={false}
              />
            </div>
          </div>
          <div className="aside-secondary d-flex flex-row-fluid">
            <div className="aside-workspace my-5 p-5" id="kt_aside_wordspace">
              <div className="d-flex h-100 flex-column">
                <SidebarMenu />
              </div>
            </div>
          </div>
          <button
            className="btn btn-sm btn-icon bg-body btn-color-gray-700 btn-active-primary position-absolute translate-middle start-100 end-0 bottom-0 shadow-sm d-none d-lg-flex"
            data-kt-toggle="true"
            data-kt-toggle-state="active"
            data-kt-toggle-target="body"
            data-kt-toggle-name="aside-minimize"
            style={{ marginBottom: "1.35rem" }}
          >
            <span className="svg-icon svg-icon-2 rotate-180" />
          </button>
        </div>

        {/* Wrapper */}
        <div
          className="wrapper d-flex flex-column flex-row-fluid"
          id="kt_wrapper"
        >
          <div
            id="kt_header"
            className="header d-lg-none"
            data-kt-sticky="true"
            data-kt-sticky-name="header"
            data-kt-sticky-offset="{default: '200px', lg: '300px'}"
          >
            <div
              className={`${containerClass} d-flex align-items-center justify-content-between`}
              id="kt_header_container"
            >
              <div className="d-flex d-lg-none align-items-center ms-n2 me-2">
                <div
                  className="btn btn-icon btn-active-icon-primary"
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
                <a href="/" className="d-flex align-items-center">
                  <Theme7Brand imageClass="h-30px" />
                </a>
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

export default Theme7Layout;
