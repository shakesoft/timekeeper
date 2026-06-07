import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Theme13Brand from "./Theme13Brand";
import { SidebarMenu } from "../../sidebar-menu/SidebarMenu";
import { Footer } from "../../Footer";
import TopBar from "../../TopBar";

const Theme13Layout: React.FC = () => {
  useEffect(() => {
    document.body.classList.add(
      "header-fixed",
      "header-tablet-and-mobile-fixed",
      "toolbar-enabled",
      "toolbar-fixed",
      "toolbar-tablet-and-mobile-fixed",
      "aside-enabled",
      "aside-fixed",
    );
    return () => {
      document.body.classList.remove(
        "header-fixed",
        "header-tablet-and-mobile-fixed",
        "toolbar-enabled",
        "toolbar-fixed",
        "toolbar-tablet-and-mobile-fixed",
        "aside-enabled",
        "aside-fixed",
      );
    };
  }, []);

  return (
    <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
      <div className="page d-flex flex-row flex-column-fluid">
        <div
          id="kt_aside"
          className="aside aside-dark aside-hoverable"
          data-kt-drawer="true"
          data-kt-drawer-name="aside"
          data-kt-drawer-activate="{default: true, lg: false}"
          data-kt-drawer-overlay="true"
          data-kt-drawer-width="{default:'200px', '300px': '250px'}"
          data-kt-drawer-direction="start"
          data-kt-drawer-toggle="#kt_aside_mobile_toggle"
        >
          <div className="aside-logo flex-column-auto" id="kt_aside_logo">
            <Theme13Brand />
            <div
              id="kt_aside_toggle"
              className="btn btn-icon w-auto px-0 btn-active-color-primary aside-toggle me-n2"
              data-kt-toggle="true"
              data-kt-toggle-state="active"
              data-kt-toggle-target="body"
              data-kt-toggle-name="aside-minimize"
            >
              <span className="svg-icon svg-icon-1 rotate-180">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    opacity="0.5"
                    d="M14.2657 11.4343L18.45 7.25C18.8642 6.83579 18.8642 6.16421 18.45 5.75C18.0358 5.33579 17.3642 5.33579 16.95 5.75L11.4071 11.2929C11.0166 11.6834 11.0166 12.3166 11.4071 12.7071L16.95 18.25C17.3642 18.6642 18.0358 18.6642 18.45 18.25C18.8642 17.8358 18.8642 17.1642 18.45 16.75L14.2657 12.5657C13.9533 12.2533 13.9533 11.7467 14.2657 11.4343Z"
                    fill="currentColor"
                  />
                  <path
                    d="M8.2657 11.4343L12.45 7.25C12.8642 6.83579 12.8642 6.16421 12.45 5.75C12.0358 5.33579 11.3642 5.33579 10.95 5.75L5.40712 11.2929C5.01659 11.6834 5.01659 12.3166 5.40712 12.7071L10.95 18.25C11.3642 18.6642 12.0358 18.6642 12.45 18.25C12.8642 17.8358 12.8642 17.1642 12.45 16.75L8.2657 12.5657C7.95328 12.2533 7.95328 11.7467 8.2657 11.4343Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </div>
          </div>
          <div className="aside-menu flex-column-fluid">
            <div
              className="hover-scroll-overlay-y my-2 py-2"
              id="kt_aside_menu_wrapper"
              data-kt-scroll="true"
              data-kt-scroll-activate="{default: false, lg: true}"
              data-kt-scroll-height="auto"
              data-kt-scroll-dependencies="#kt_aside_logo, #kt_aside_footer"
              data-kt-scroll-wrappers="#kt_aside_menu"
              data-kt-scroll-offset="0"
            >
              <SidebarMenu menuClass="menu menu-column menu-title-gray-800 menu-state-title-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500" />
            </div>
          </div>
        </div>
        <div
          className="wrapper d-flex flex-column flex-row-fluid"
          id="kt_wrapper"
        >
          <div id="kt_header" className="header align-items-stretch">
            <div className="container-fluid d-flex align-items-stretch justify-content-between">
              <div
                className="d-flex align-items-center d-lg-none ms-n3 me-1"
                title="Show aside menu"
              >
                <div
                  className="btn btn-icon btn-active-color-white"
                  id="kt_aside_mobile_toggle"
                >
                  <i className="bi bi-list fs-1" />
                </div>
              </div>
              <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
                <a href="/" className="d-lg-none">
                  <Theme13Brand />
                </a>
              </div>
              <div className="d-flex align-items-stretch justify-content-end flex-lg-grow-1">
                <div className="d-flex align-items-stretch flex-shrink-0">
                  <TopBar
                    className="topbar d-flex align-items-stretch flex-shrink-0"
                    buttonClassName="btn btn-relative btn-icon btn-active-color-white w-30px h-30px w-md-40px h-md-40px position-relative"
                    userMenuTogglerClassName="topbar-item cursor-pointer symbol px-3 px-lg-5 me-n3 me-lg-n5 symbol-30px symbol-md-35px"
                  />
                </div>
              </div>
            </div>
          </div>
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

export default Theme13Layout;
