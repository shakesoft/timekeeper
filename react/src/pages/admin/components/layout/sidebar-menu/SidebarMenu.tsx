import { useEffect } from "react";
import { SidebarMenuMain } from "./SidebarMenuMain";
import MenuSearchBar from "../MenuSearchBar";
import { reInitMenu } from "metronic/app/helpers";
import { useSelector } from "react-redux";
import { selectMenuSearchActive } from "@/app/slices/uiSlice";

interface SidebarMenuProps {
  iconMenu?: boolean;
  menuClass?: string;
}

const SidebarMenu = ({
  iconMenu = false,
  menuClass = "menu menu-column menu-rounded menu-sub-indention px-3",
}: SidebarMenuProps) => {
  const searchActive = useSelector(selectMenuSearchActive);

  useEffect(() => {
    reInitMenu();
  }, []);

  return (
    <div className="app-sidebar-menu overflow-hidden flex-column-fluid">
      <div
        id="kt_app_sidebar_menu_wrapper"
        className="app-sidebar-wrapper hover-scroll-overlay-y my-5"
        data-kt-scroll="true"
        data-kt-scroll-activate="true"
        data-kt-scroll-height="auto"
        data-kt-scroll-dependencies="#kt_app_sidebar_logo, #kt_app_sidebar_footer"
        data-kt-scroll-wrappers="#kt_app_sidebar_menu"
        data-kt-scroll-offset="5px"
        data-kt-scroll-save-state="true"
      >
        <div
          className={menuClass}
          id="kt_app_sidebar_menu"
          data-kt-menu="true"
          data-kt-menu-expand="false"
        >
          {searchActive && (
            <div className={`menu-item ${iconMenu ? "d-none d-lg-block" : ""}`}>
              <div className="menu-content">
                <MenuSearchBar />
              </div>
            </div>
          )}
          <SidebarMenuMain iconMenu={iconMenu} />
        </div>
      </div>
    </div>
  );
};

export { SidebarMenu };
