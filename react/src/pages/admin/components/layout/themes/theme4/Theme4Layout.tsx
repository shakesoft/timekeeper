import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Theme4Brand from "./Theme4Brand";
import { Footer } from "../../Footer";
import { useTheme } from "@/hooks/useTheme";
import TopBar from "../../TopBar";
import { TopbarMenu } from "../../topbar/TopbarMenu";

const Theme4Layout: React.FC = () => {
  const { containerClass } = useTheme();

  useEffect(() => {
    document.body.classList.add(
      "header-fixed",
      "header-tablet-and-mobile-fixed",
      "aside-fixed",
      "aside-secondary-disabled",
    );
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
          className="aside bg-primary"
          data-kt-drawer="true"
          data-kt-drawer-name="aside"
          data-kt-drawer-activate="{default: true, lg: false}"
          data-kt-drawer-overlay="true"
          data-kt-drawer-width="auto"
          data-kt-drawer-direction="start"
          data-kt-drawer-toggle="#kt_aside_toggle"
        >
          <div
            className="aside-logo d-none d-lg-flex flex-column align-items-center flex-column-auto py-8"
            id="kt_aside_logo"
          >
            <Theme4Brand />
          </div>
          <div
            className="aside-nav d-flex flex-column align-lg-center flex-column-fluid w-100 pt-5 pt-lg-0"
            id="kt_aside_nav"
          />
          <div
            className="aside-footer d-flex flex-column align-items-center flex-column-auto"
            id="kt_aside_footer"
          />
        </div>

        {/* Wrapper */}
        <div
          className="wrapper d-flex flex-column flex-row-fluid"
          id="kt_wrapper"
        >
          <div id="kt_header" className="header bg-white align-items-stretch">
            <div
              className={`${containerClass} d-flex align-items-stretch justify-content-between`}
            >
              {/* Aside mobile toggle */}
              <div
                className="d-flex align-items-center d-lg-none ms-n3 me-1"
                title="Show aside menu"
              >
                <div
                  className="btn btn-icon btn-active-color-primary w-40px h-40px"
                  id="kt_header_menu_mobile_toggle"
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
              {/* Mobile logo */}
              <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0 d-lg-none">
                <Theme4Brand customStyle="h-25px" />
              </div>
              {/* Wrapper */}
              <div className="d-flex align-items-stretch justify-content-between flex-lg-grow-1">
                {/* Navbar */}
                <div className="d-flex align-items-stretch" id="kt_header_nav">
                  <div
                    className="header-menu align-items-stretch"
                    data-kt-drawer="true"
                    data-kt-drawer-name="header-menu"
                    data-kt-drawer-activate="{default: true, lg: false}"
                    data-kt-drawer-overlay="true"
                    data-kt-drawer-width="{default:'200px', '300px': '250px'}"
                    data-kt-drawer-direction="end"
                    data-kt-drawer-toggle="#kt_header_menu_mobile_toggle"
                    data-kt-swapper="true"
                    data-kt-swapper-mode="prepend"
                    data-kt-swapper-parent="{default: '#kt_body', lg: '#kt_header_nav'}"
                  >
                    <TopbarMenu />
                  </div>
                </div>
                {/* Topbar */}
                <div className="d-flex align-items-stretch justify-self-end flex-shrink-0">
                  <TopBar
                    className="d-flex align-items-stretch flex-shrink-0"
                    buttonClassName="btn btn-icon btn-active-light-primary position-relative btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px"
                    userMenuIconOnly={true}
                  />
                </div>
              </div>
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

export default Theme4Layout;
