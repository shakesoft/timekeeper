import React, { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import Theme2Brand from "./Theme2Brand";
import { Footer } from "../../Footer";
import { TopbarMenu } from "../../topbar/TopbarMenu";
import TopBar from "../../TopBar";
import { useTheme } from "@/hooks/useTheme";

const Theme2Layout: React.FC = () => {
  const ktHeaderRef = useRef<HTMLDivElement | null>(null);
  const { containerClass } = useTheme();

  const theme2BtnClass =
    "btn btn-icon btn-active-light-primary btn-custom w-30px h-30px w-md-40px h-md-40px position-relative";

  useEffect(() => {
    const body = document.body;
    body.classList.add(
      "header-fixed",
      "header-tablet-and-mobile-fixed",
      "toolbar-enabled",
    );
    return () => {
      body.classList.remove(
        "header-fixed",
        "header-tablet-and-mobile-fixed",
        "toolbar-enabled",
      );
    };
  }, []);

  return (
    <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
      <div className="d-flex flex-row flex-column-fluid page">
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
            ref={ktHeaderRef}
          >
            <div className={containerClass + "  d-flex align-items-center"}>
              <div
                className="d-flex topbar align-items-center d-lg-none ms-n2 me-3"
                title="Show aside menu"
              >
                <div
                  className="btn btn-icon btn-active-light-primary btn-custom w-30px h-30px w-md-40px h-md-40px"
                  id="kt_header_menu_mobile_toggle"
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
              <Theme2Brand />
              <div className="d-flex align-items-stretch flex-grow-1 ms-10">
                <div className="d-flex align-items-stretch" id="kt_header_nav">
                  <div
                    className="header-menu align-items-stretch"
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
                <TopBar
                  className="topbar d-flex align-items-stretch flex-shrink-0 ms-auto"
                  buttonClassName={theme2BtnClass}
                  userMenuIconOnly={true}
                />
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

export default Theme2Layout;
