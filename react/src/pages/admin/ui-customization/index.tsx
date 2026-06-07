import React, { useEffect, useState } from "react";
//
import PageHeader from "../components/common/PageHeader";
import { useSelector } from "react-redux";
import { type RootState } from "../../../app/store";
import { usePermissions } from "../../../hooks/usePermissions";
import { useTheme } from "../../../hooks/useTheme";
import {
  ThemeSettingsDto,
  UiCustomizationSettingsServiceProxy,
} from "../../../api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

import DefaultThemeSettingsForm from "./components/DefaultThemeSettingsForm";
import Theme2SettingsForm from "./components/Theme2SettingsForm";
import Theme3SettingsForm from "./components/Theme3SettingsForm";
import Theme4SettingsForm from "./components/Theme4SettingsForm";
import Theme5SettingsForm from "./components/Theme5SettingsForm";
import Theme6SettingsForm from "./components/Theme6SettingsForm";
import Theme7SettingsForm from "./components/Theme7SettingsForm";
import Theme8SettingsForm from "./components/Theme8SettingsForm";
import Theme9SettingsForm from "./components/Theme9SettingsForm";
import Theme10SettingsForm from "./components/Theme10SettingsForm";
import Theme11SettingsForm from "./components/Theme11SettingsForm";
import Theme12SettingsForm from "./components/Theme12SettingsForm";
import Theme13SettingsForm from "./components/Theme13SettingsForm";

const sortThemes = (settings: ThemeSettingsDto[]): ThemeSettingsDto[] => {
  return [...(settings ?? [])].sort((a, b) => {
    const av =
      a.theme === "default"
        ? 0
        : parseInt(String(a.theme).replace("theme", "")) || 0;
    const bv =
      b.theme === "default"
        ? 0
        : parseInt(String(b.theme).replace("theme", "")) || 0;
    return av - bv;
  });
};

const UiCustomizationPage: React.FC = () => {
  const { isGranted } = usePermissions();
  const activeThemeName = useSelector((s: RootState) => s.ui.activeThemeName);
  const { containerClass } = useTheme();

  const uiCustomizationSettingsService = useServiceProxy(
    UiCustomizationSettingsServiceProxy,
    [],
  );

  const [themes, setThemes] = useState<ThemeSettingsDto[]>([]);
  const [activeKey, setActiveKey] = useState<string>("");

  useEffect(() => {
    uiCustomizationSettingsService
      .getUiManagementSettings()
      .then((res) => {
        const sorted = sortThemes(res || []);
        setThemes(sorted);
        const nextActive = String(activeThemeName || sorted[0]?.theme || "");
        setActiveKey(nextActive);
      });
  }, [uiCustomizationSettingsService, activeThemeName]);

  return (
    <div>
      <PageHeader
        title={L("VisualSettings")}
        description={L("UiCustomizationHeaderInfo")}
      />

      <div className={containerClass}>
        <div className="card card-custom gutter-b">
          <div className="card-body">
            <div className="theme-tabs-header">
              {(themes || []).map((theme) => {
                const key = String(theme.theme);
                const isActive = key === activeKey;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`theme-tab${isActive ? " active" : ""}`}
                    onClick={() => setActiveKey(key)}
                  >
                    <div className="theme-select-box">
                      <img
                        src={`/assets/common/images/metronic-themes/${theme.theme}.png`}
                        width={150}
                        alt={`theme ${theme.theme}`}
                      />
                      <span className="theme-name">
                        {L(
                          `Theme_${String(theme.theme ?? "default")
                            .charAt(0)
                            .toUpperCase()}${String(theme.theme ?? "default").slice(1)}`,
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="theme-tabs-content mt-6">
              {(themes || []).map((theme) => {
                const key = String(theme.theme);
                const isActive = key === activeKey;
                return (
                  <div
                    key={key}
                    style={{ display: isActive ? "block" : "none" }}
                  >
                    {key === "default" && (
                      <DefaultThemeSettingsForm
                        initialSettings={theme}
                        canSaveAsSystemDefault={isGranted(
                          "Pages.Administration.UiCustomization",
                        )}
                      />
                    )}
                    {key === "theme2" && (
                      <Theme2SettingsForm
                        initialSettings={theme}
                        canSaveAsSystemDefault={isGranted(
                          "Pages.Administration.UiCustomization",
                        )}
                      />
                    )}
                    {key === "theme3" && (
                      <Theme3SettingsForm
                        initialSettings={theme}
                        canSaveAsSystemDefault={isGranted(
                          "Pages.Administration.UiCustomization",
                        )}
                      />
                    )}
                    {key === "theme4" && (
                      <Theme4SettingsForm
                        initialSettings={theme}
                        canSaveAsSystemDefault={isGranted(
                          "Pages.Administration.UiCustomization",
                        )}
                      />
                    )}
                    {key === "theme5" && (
                      <Theme5SettingsForm
                        initialSettings={theme}
                        canSaveAsSystemDefault={isGranted(
                          "Pages.Administration.UiCustomization",
                        )}
                      />
                    )}
                    {key === "theme6" && (
                      <Theme6SettingsForm
                        initialSettings={theme}
                        canSaveAsSystemDefault={isGranted(
                          "Pages.Administration.UiCustomization",
                        )}
                      />
                    )}
                    {key === "theme7" && (
                      <Theme7SettingsForm
                        initialSettings={theme}
                        canSaveAsSystemDefault={isGranted(
                          "Pages.Administration.UiCustomization",
                        )}
                      />
                    )}
                    {key === "theme8" && (
                      <Theme8SettingsForm
                        initialSettings={theme}
                        canSaveAsSystemDefault={isGranted(
                          "Pages.Administration.UiCustomization",
                        )}
                      />
                    )}
                    {key === "theme9" && (
                      <Theme9SettingsForm
                        initialSettings={theme}
                        canSaveAsSystemDefault={isGranted(
                          "Pages.Administration.UiCustomization",
                        )}
                      />
                    )}
                    {key === "theme10" && (
                      <Theme10SettingsForm
                        initialSettings={theme}
                        canSaveAsSystemDefault={isGranted(
                          "Pages.Administration.UiCustomization",
                        )}
                      />
                    )}
                    {key === "theme11" && (
                      <Theme11SettingsForm
                        initialSettings={theme}
                        canSaveAsSystemDefault={isGranted(
                          "Pages.Administration.UiCustomization",
                        )}
                      />
                    )}
                    {key === "theme12" && (
                      <Theme12SettingsForm
                        initialSettings={theme}
                        canSaveAsSystemDefault={isGranted(
                          "Pages.Administration.UiCustomization",
                        )}
                      />
                    )}
                    {key === "theme13" && (
                      <Theme13SettingsForm
                        initialSettings={theme}
                        canSaveAsSystemDefault={isGranted(
                          "Pages.Administration.UiCustomization",
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .theme-tabs-header{ display: flex; flex-wrap: wrap; gap: 16px; }
        .theme-tab{ border: none; background: transparent; padding: 0; cursor: pointer; }
        .theme-tab:focus{ outline: none; }
        .theme-tab.active .theme-select-box{ outline: 2px solid var(--bs-primary); border-radius: 6px; }
        .theme-select-box{ position: relative; height:150px; }
        .theme-select-box .theme-name{ position: absolute; margin: 0 auto; left: 0; bottom: 0; right: 0; text-align: center; width: 60%; }
      `}</style>
    </div>
  );
};

export default UiCustomizationPage;
