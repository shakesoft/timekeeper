import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Theme8Brand from "./Theme8Brand";
import { Footer } from "../../Footer";
import { useTheme } from "@/hooks/useTheme";
import TopBar from "../../TopBar";
import { SidebarMenu } from "../../sidebar-menu/SidebarMenu";

const Theme8Layout: React.FC = () => {
  const { containerClass } = useTheme();

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
        <div
          id="kt_aside"
          className="aside"
          data-kt-drawer="true"
          data-kt-drawer-name="aside"
          data-kt-drawer-activate="{default: true, lg: false}"
          data-kt-drawer-overlay="true"
          data-kt-drawer-width="{default:'200px', '300px': '250px'}"
          data-kt-drawer-direction="start"
          data-kt-drawer-toggle="#kt_aside_mobile_toggle"
        >
          <div className="aside-menu flex-column-fluid">
            <SidebarMenu />
          </div>
        </div>
        <div
          className="wrapper d-flex flex-column flex-row-fluid"
          id="kt_wrapper"
        >
          <div id="kt_header" className="header align-items-stretch">
            <div className="header-brand">
              <Theme8Brand />
              <div
                id="kt_aside_toggle"
                className="btn btn-icon w-auto px-0 btn-active-color-primary aside-minimize"
                data-kt-toggle="true"
                data-kt-toggle-state="active"
                data-kt-toggle-target="body"
                data-kt-toggle-name="aside-minimize"
              >
                <span className="svg-icon svg-icon-1 me-n1 minimize-default" />
                <span className="svg-icon svg-icon-1 minimize-active" />
              </div>
              <div
                className="d-flex align-items-center d-lg-none ms-n3 me-1"
                title="Show aside menu"
              >
                <div
                  className="btn btn-icon btn-active-color-primary w-30px h-30px"
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
              </div>
            </div>
            <div className="toolbar">
              <div
                className={`${containerClass} py-6 py-lg-0 d-flex flex-column flex-lg-row align-items-lg-stretch justify-content-end`}
              >
                <div className="d-flex align-items-center pt-3 pt-lg-0 justify-content-end">
                  <TopBar
                    className="d-flex align-items-stretch flex-shrink-0"
                    buttonClassName="btn btn-relative btn-sm btn-icon btn-icon-muted btn-active-icon-primary position-relative"
                    userMenuTogglerClassName="cursor-pointer symbol symbol-30px symbol-md-40px"
                    profileImageClassName="h-30px h-md-40px"
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

export default Theme8Layout;
