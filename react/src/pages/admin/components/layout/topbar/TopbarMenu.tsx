import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { reInitMenu, KTIcon } from "metronic/app/helpers";
import { useAppMenu, type AppMenuItem } from "@/lib/navigation/appNavigation";
import { useSelector } from "react-redux";
import { selectMenuSearchActive } from "@/app/slices/uiSlice";
import MenuSearchBar from "../MenuSearchBar";

const TopbarMenu = () => {
  const menuItems = useAppMenu();
  const items = useMemo(() => menuItems, [menuItems]);
  const searchActive = useSelector(selectMenuSearchActive);

  useEffect(() => {
    reInitMenu();
  }, [items]);

  const renderIconNode = (item: AppMenuItem) => {
    if (item?.icon)
      return <KTIcon iconName={item.icon} className={"svg-icon-2"} />;
    return null;
  };

  const renderIcon = (item: AppMenuItem) => {
    const node = renderIconNode(item);
    if (!node) return null;
    return <span className={"menu-icon me-2"}>{node}</span>;
  };

  const renderLeaf = (item: AppMenuItem) => {
    if (item.external && item.route) {
      return (
        <div className="menu-item px-2" key={item.id}>
          <a
            href={item.route}
            target="_blank"
            rel="noreferrer noopener"
            className="menu-link px-3"
            data-kt-menu-dismiss="true"
          >
            {renderIcon(item)}
            <span className="menu-title">{item.title}</span>
          </a>
        </div>
      );
    }
    return (
      <div className="menu-item px-2" key={item.id}>
        <Link
          to={item.route || "#"}
          className="menu-link px-3"
          data-kt-menu-dismiss="true"
        >
          {renderIcon(item)}
          <span className="menu-title">{item.title}</span>
        </Link>
      </div>
    );
  };

  const renderBranch = (item: AppMenuItem, isTopLevel: boolean = true) => (
    <div
      data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
      data-kt-menu-placement={isTopLevel ? "bottom-start" : "right-start"}
      className="menu-item menu-lg-down-accordion me-0 me-lg-2"
      key={item.id}
    >
      <span className="menu-link py-3">
        {renderIcon(item)}
        <span className="menu-title">{item.title}</span>
        <span className="menu-arrow"></span>
      </span>
      <div
        className="menu-sub menu-sub-lg-down-accordion menu-sub-lg-dropdown menu-rounded-0 py-lg-4 w-lg-225px"
        data-kt-menu-dismiss="true"
      >
        {(item.children || []).map((child) =>
          child.children && child.children.length
            ? renderBranch(child, false)
            : renderLeaf(child),
        )}
      </div>
    </div>
  );

  const renderItem = (item: AppMenuItem) =>
    item.children && item.children.length
      ? renderBranch(item)
      : renderLeaf(item);

  return (
    <div
      className="menu menu-rounded menu-column menu-lg-row menu-active-bg menu-title-gray-700 menu-state-primary menu-arrow-gray-500 fw-semibold my-5 my-lg-0 align-items-stretch px-2 px-lg-0 w-100"
      id="kt_header_menu"
      data-kt-menu="true"
    >
      {searchActive && (
        <div className="menu-item here menu-lg-down-accordion me-lg-1 d-lg-none">
          <div className="menu-content w-100">
            <MenuSearchBar />
          </div>
        </div>
      )}
      {items.map((i) => renderItem(i))}
      {searchActive && (
        <div className="menu-item here menu-lg-down-accordion me-lg-1 d-none d-lg-block">
          <div className="menu-content w-100">
            <MenuSearchBar />
          </div>
        </div>
      )}
    </div>
  );
};

export { TopbarMenu };
