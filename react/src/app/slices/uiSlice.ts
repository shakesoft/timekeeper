import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";

export interface SubHeaderSettings {
  subheaderSize: number;
  titleStyle: string;
  containerStyle: string;
}

export interface BaseSettings {
  subHeader: SubHeaderSettings;
  menu?: {
    searchActive?: boolean;
  };
}

export interface ThemeSettings {
  baseSettings: BaseSettings;
}

export interface UiState {
  theme: ThemeSettings;
  activeThemeName: string;
  containerClass: string;
  isLoading: boolean;
  isProfileModalVisible: boolean;
  isThemePanelVisible: boolean;
  isChatPanelVisible: boolean;
}

const initialState: UiState = {
  activeThemeName: localStorage.getItem("appTheme") || "default",
  theme: {
    baseSettings: {
      subHeader: {
        subheaderSize: 1,
        titleStyle: "fs-1 fw-bolder text-dark",
        containerStyle: "subheader py-3 py-lg-6",
      },
    },
  },
  containerClass: "container-xxl",
  isLoading: false,
  isProfileModalVisible: false,
  isThemePanelVisible: false,
  isChatPanelVisible: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setActiveTheme: (state, action: PayloadAction<string>) => {
      state.activeThemeName = action.payload;
      localStorage.setItem("appTheme", action.payload);
    },
    setThemeSettings: (state, action: PayloadAction<ThemeSettings>) => {
      state.theme = action.payload;
    },
    updateSubHeaderSettings: (
      state,
      action: PayloadAction<Partial<SubHeaderSettings>>,
    ) => {
      state.theme.baseSettings.subHeader = {
        ...state.theme.baseSettings.subHeader,
        ...action.payload,
      };
    },
    setContainerClass: (state, action: PayloadAction<string>) => {
      state.containerClass = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    toggleProfileModal: (state) => {
      state.isProfileModalVisible = !state.isProfileModalVisible;
    },
    toggleThemePanel: (state) => {
      state.isThemePanelVisible = !state.isThemePanelVisible;
    },
    toggleChatPanel: (state) => {
      state.isChatPanelVisible = !state.isChatPanelVisible;
    },
  },
});

export const {
  setActiveTheme,
  setThemeSettings,
  updateSubHeaderSettings,
  setContainerClass,
  setLoading,
  toggleProfileModal,
  toggleThemePanel,
  toggleChatPanel,
} = uiSlice.actions;

export default uiSlice.reducer;

type BaseSettingsWithLayout = { layout?: { darkMode?: boolean } };
export function isDarkMode(theme: ThemeSettings): boolean {
  const base = theme?.baseSettings as unknown;
  const hasLayout = !!base && typeof base === "object" && "layout" in base;
  return hasLayout
    ? !!(base as BaseSettingsWithLayout).layout?.darkMode
    : false;
}

export const selectMenuSearchActive = (state: RootState): boolean => {
  const base = state.ui.theme?.baseSettings as BaseSettings | undefined;
  return !!base?.menu?.searchActive;
};
