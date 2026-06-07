import React, { type JSX } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { useTheme } from "../../../../hooks/useTheme";

export interface BreadcrumbItem {
  text: string;
  route?: string;
  state?: unknown;
}

export interface SubHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

const SubHeader: React.FC<SubHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
}) => {
  const { containerClass, headerSize, titleStyle, containerStyle } = useTheme();

  const TitleTag =
    `h${Math.min(Math.max(headerSize || 1, 1), 6)}` as unknown as keyof JSX.IntrinsicElements;

  const hasDescription = Boolean(description);
  const hasBreadcrumbs = Boolean(breadcrumbs && breadcrumbs.length > 0);

  return (
    <div className={classNames(containerStyle, "toolbar")}>
      <div
        className={classNames(
          containerClass,
          "d-flex align-items-center justify-content-between flex-wrap flex-sm-nowrap",
        )}
      >
        <div className="d-flex align-items-center flex-wrap me-2">
          <TitleTag className={titleStyle as string}>{title}</TitleTag>

          {hasDescription && <div className="mt-2 mb-2 me-4 bg-gray-200"></div>}
          {hasDescription && (
            <div className="d-flex align-items-center">
              <span className="text-muted fw-bold me-4">{description}</span>
            </div>
          )}

          {hasBreadcrumbs && <div className="mt-2 mb-2 me-4 bg-gray-200"></div>}
          {hasBreadcrumbs && (
            <ul className="breadcrumb breadcrumb-transparent breadcrumb-dot fw-bold p-0 my-2 fs-sm">
              {breadcrumbs!.map((breadcrumbItem, index) => (
                <li
                  className="breadcrumb-item"
                  key={`${breadcrumbItem.text}-${index}`}
                >
                  {breadcrumbItem.route ? (
                    <Link
                      to={breadcrumbItem.route}
                      state={breadcrumbItem.state}
                      style={{ cursor: "pointer" }}
                    >
                      {breadcrumbItem.text}
                    </Link>
                  ) : (
                    <span className="text-muted">{breadcrumbItem.text}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="d-flex align-items-center">{actions}</div>
      </div>
    </div>
  );
};

export default SubHeader;
