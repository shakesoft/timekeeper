import React, { type JSX } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { useTheme } from "../../../../hooks/useTheme";

export interface BreadcrumbItem {
  text: string;
  route?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
}) => {
  const { containerClass, headerSize, titleStyle, containerStyle } = useTheme();
  const TitleTag = `h${headerSize}` as keyof JSX.IntrinsicElements;

  return (
    <div className={classNames(containerStyle, "toolbar subheader")}>
      <div
        className={classNames(
          containerClass,
          "d-flex align-items-center justify-content-between flex-wrap flex-sm-nowrap",
        )}
      >
        <div className="d-flex align-items-center flex-wrap me-2">
          <TitleTag className={titleStyle}>{title}</TitleTag>

          {description && <div className="mt-2 mb-2 me-4 bg-gray-200"></div>}
          {description && (
            <span className="text-muted fw-bold me-4">{description}</span>
          )}

          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="mt-2 mb-2 me-4 bg-gray-200"></div>
          )}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <ul className="breadcrumb breadcrumb-transparent breadcrumb-dot fw-bold p-0 my-2 fs-sm">
              {breadcrumbs.map((item, index) => (
                <li className="breadcrumb-item" key={index}>
                  {item.route ? (
                    <Link to={item.route}>{item.text}</Link>
                  ) : (
                    <span className="text-muted">{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {actions && <div className="d-flex align-items-center">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
