import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../../app/store";
import DefaultLayout from "./default/DefaultLayout.tsx";
import Theme2Layout from "./theme2/Theme2Layout.tsx";
import Theme3Layout from "./theme3/Theme3Layout.tsx";
import Theme4Layout from "./theme4/Theme4Layout.tsx";
import Theme5Layout from "./theme5/Theme5Layout.tsx";
import Theme6Layout from "./theme6/Theme6Layout.tsx";
import Theme7Layout from "./theme7/Theme7Layout.tsx";
import Theme8Layout from "./theme8/Theme8Layout.tsx";
import Theme9Layout from "./theme9/Theme9Layout.tsx";
import Theme10Layout from "./theme10/Theme10Layout.tsx";
import Theme11Layout from "./theme11/Theme11Layout.tsx";
import Theme12Layout from "./theme12/Theme12Layout.tsx";
import Theme13Layout from "./theme13/Theme13Layout.tsx";

const ThemedLayout: React.FC = () => {
  const activeThemeName = useSelector(
    (s: RootState) => s.ui.activeThemeName || "default",
  );

  switch (activeThemeName) {
    case "theme2":
      return <Theme2Layout />;
    case "theme3":
      return <Theme3Layout />;
    case "theme4":
      return <Theme4Layout />;
    case "theme5":
      return <Theme5Layout />;
    case "theme6":
      return <Theme6Layout />;
    case "theme7":
      return <Theme7Layout />;
    case "theme8":
      return <Theme8Layout />;
    case "theme9":
      return <Theme9Layout />;
    case "theme10":
      return <Theme10Layout />;
    case "theme11":
      return <Theme11Layout />;
    case "theme12":
      return <Theme12Layout />;
    case "theme13":
      return <Theme13Layout />;
    case "default":
    default:
      return <DefaultLayout />;
  }
};

export default ThemedLayout;
