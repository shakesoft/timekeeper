import dayjs from "dayjs";

import { useLayout } from "metronic/app/partials/layout/core";
import { useSession } from "@/hooks/useSession";

const Footer = () => {
  const { config } = useLayout();
  const { tenant, application, theme } = useSession();

  const tenantEdition = tenant?.edition?.displayName
    ? String(tenant.edition.displayName)
    : "";
  const apiVersion = application?.version ? `v${application.version}` : "";
  const releaseDate = application?.releaseDate
    ? dayjs(application.releaseDate).format("YYYYMMDD")
    : "";
  const footerWidthType = theme?.baseSettings?.footer?.footerWidthType;
  const footerContainerClass =
    footerWidthType === "fluid" ? "container-fluid" : "container-xxl";

  if (!config.app?.footer?.display) {
    return null;
  }

  return (
    <div className="footer py-4 d-flex flex-lg-column" id="kt_footer">
      <div
        className={`${footerContainerClass} d-flex flex-column flex-md-row align-items-center justify-content-between`}
      >
        <div className="text-gray-900 order-2 order-md-1">
          <span className="text-muted fw-bold me-1">
            CadentManagement {tenantEdition && <span>{tenantEdition}</span>} |
            API: {apiVersion || "-"} | Client: {apiVersion}{" "}
            {releaseDate && `[${releaseDate}]`}
          </span>
        </div>
        <ul className="menu menu-gray-600 menu-hover-primary fw-bold order-1"></ul>
      </div>
    </div>
  );
};

export { Footer };
