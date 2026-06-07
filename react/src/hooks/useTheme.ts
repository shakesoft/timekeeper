import { useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "../app/store";

import {
  setThemeSettings,
  setContainerClass,
  updateSubHeaderSettings,
  type ThemeSettings,
  type SubHeaderSettings,
} from "../app/slices/uiSlice";

export const useTheme = () => {
  const dispatch = useDispatch();

  const theme = useSelector((state: RootState) => state.ui.theme);
  const storedContainerClass = useSelector(
    (state: RootState) => state.ui.containerClass,
  );

  const updateTheme = useCallback(
    (newTheme: ThemeSettings) => {
      dispatch(setThemeSettings(newTheme));
    },
    [dispatch],
  );

  const updateContainerClass = useCallback(
    (className: string) => {
      dispatch(setContainerClass(className));
    },
    [dispatch],
  );

  const updateSubHeader = useCallback(
    (settings: Partial<SubHeaderSettings>) => {
      dispatch(updateSubHeaderSettings(settings));
    },
    [dispatch],
  );

  const headerSize = useMemo(
    () => theme?.baseSettings?.subHeader?.subheaderSize || 1,
    [theme],
  );
  const titleStyle = useMemo(
    () => theme?.baseSettings?.subHeader?.titleStyle || "",
    [theme],
  );
  const containerStyle = useMemo(
    () => theme?.baseSettings?.subHeader?.containerStyle || "",
    [theme],
  );

  const containerClass = useMemo(() => {
    const base = theme?.baseSettings as unknown;
    const hasLayout = !!base && typeof base === "object" && "layout" in base;

    if (hasLayout) {
      const layout = (base as { layout?: { layoutType?: string } }).layout;
      const layoutType = layout?.layoutType;

      if (layoutType === "fixed") {
        return "container-xxl";
      } else if (layoutType === "fluid") {
        return "container-fluid";
      }
    }

    return storedContainerClass || "container-xxl";
  }, [theme, storedContainerClass]);

  return {
    theme,
    containerClass,
    updateTheme,
    updateContainerClass,
    updateSubHeader,
    headerSize,
    titleStyle,
    containerStyle,
  };
};
