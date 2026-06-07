import { useEffect, useState } from "react";
import {
  MenuComponent,
  DrawerComponent,
  ScrollComponent,
  ScrollTopComponent,
  StickyComponent,
  ToggleComponent,
  SwapperComponent,
} from "metronic/app/kt/components";
import { ThemeModeComponent } from "metronic/assets/ts/layout";

import { useLayout } from "./core";
import { Tab } from "bootstrap";

export function MasterInit() {
  const { config } = useLayout();
  const [initialized, setInitialized] = useState(false);
  const pluginsInitialization = () => {
    ThemeModeComponent.init();
    setTimeout(() => {
      ToggleComponent.bootstrap();
      ScrollTopComponent.bootstrap();
      DrawerComponent.bootstrap();
      StickyComponent.bootstrap();
      MenuComponent.bootstrap();
      ScrollComponent.bootstrap();
      SwapperComponent.bootstrap();
      document.querySelectorAll('[data-bs-toggle="tab"]').forEach((tab) => {
        Tab.getOrCreateInstance(tab);
      });
    }, 500);
  };

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      pluginsInitialization();
    }
  }, [config, initialized]);

  return <></>;
}
