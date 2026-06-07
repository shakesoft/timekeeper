import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import classNames from "classnames";

import { type RootState } from "../../../../../app/store";
import { setActiveTheme } from "../../../../../app/slices/uiSlice";
import { UiCustomizationSettingsServiceProxy } from "../../../../../api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { updateMetronicThemeBundles } from "@/lib/theme-bundles";

const THEMES: string[] = [
  "default",
  "theme2",
  "theme3",
  "theme4",
  "theme5",
  "theme6",
  "theme7",
  "theme8",
  "theme9",
  "theme10",
  "theme11",
  "theme12",
  "theme13",
];

function toPascalCase(input: string): string {
  if (!input) return "";
  return input
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

const ThemeSelectionPanel: React.FC = () => {
  const dispatch = useDispatch();
  const currentThemeName = useSelector((s: RootState) => s.ui.activeThemeName);

  const service = useServiceProxy(UiCustomizationSettingsServiceProxy, []);

  const getLocalizedThemeName = useCallback(
    (theme: string) => L(`Theme_${toPascalCase(theme)}`),
    [],
  );

  const changeTheme = useCallback(
    async (themeName: string) => {
      dispatch(setActiveTheme(themeName));
      updateMetronicThemeBundles(themeName);
      await service.changeThemeWithDefaultValues(themeName);
    },
    [dispatch, service],
  );

  return (
    <div
      id="kt_explore"
      data-kt-drawer="true"
      data-kt-drawer-name="explore"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'350px', 'lg': '475px'}"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#kt_explore_toggle"
      data-kt-drawer-close="#kt_explore_close"
      className="bg-body drawer drawer-end"
    >
      <div className="card shadow-none rounded-0 w-100">
        <div id="kt_explore_header" className="card-header">
          <h3 className="card-title fw-bolder text-gray-700">
            {L("SelectATheme")}
          </h3>
          <div className="card-toolbar">
            <button
              type="button"
              id="kt_explore_close"
              className="btn btn-sm btn-icon btn-active-light-primary me-n5"
            >
              <span className="svg-icon svg-icon-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    opacity="0.5"
                    x="6"
                    y="17.3137"
                    width="16"
                    height="2"
                    rx="1"
                    transform="rotate(-45 6 17.3137)"
                    fill="black"
                  />
                  <rect
                    x="7.41422"
                    y="6"
                    width="16"
                    height="2"
                    rx="1"
                    transform="rotate(45 7.41422 6)"
                    fill="black"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
        <div id="kt_explore_body" className="card-body">
          <div
            id="kt_explore_scroll"
            data-kt-scroll="true"
            data-kt-scroll-height="auto"
            data-kt-scroll-wrappers="#kt_explore_body"
            data-kt-scroll-dependencies="#kt_explore_header"
            data-kt-scroll-offset="5px"
            className="scroll-y me-n5 pe-5"
          >
            <div className="row g-5">
              {THEMES.map((theme) => (
                <div
                  className="col-6"
                  key={theme}
                  onClick={() => changeTheme(theme)}
                  role="button"
                >
                  <div
                    className={classNames(
                      "overlay overflow-hidden position-relative border border-4 rounded",
                      { "border-success": theme === currentThemeName },
                    )}
                  >
                    <div className="overlay-wrapper">
                      <img
                        src={`/assets/common/images/metronic-themes/${theme}.png`}
                        alt="demo"
                        className="w-100"
                      />
                    </div>
                    <div className="overlay-layer bg-dark bg-opacity-10">
                      <button
                        className="btn btn-sm btn-success shadow"
                        type="button"
                      >
                        {getLocalizedThemeName(theme)}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelectionPanel;
