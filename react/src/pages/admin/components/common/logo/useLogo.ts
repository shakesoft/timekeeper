import { useCallback, useEffect, useState } from "react";
import AppConsts from "../../../../../lib/app-consts";
import { useSession } from "@hooks/useSession";
import { useTheme } from "@hooks/useTheme";
import { isDarkMode } from "../../../../../app/slices/uiSlice";

type Skin = "light" | "dark";

export const useLogo = () => {
  const { tenant } = useSession();
  const { theme } = useTheme();
  const [refreshKey, setRefreshKey] = useState(0);

  const isDark = isDarkMode(theme);
  const defaultSkin: Skin = isDark ? "dark" : "light";

  useEffect(() => {
    const handleLogoChange = () => {
      setRefreshKey((prev) => prev + 1);
    };

    abp.event.on("app.logo.changed", handleLogoChange);

    return () => {
      abp.event.off("app.logo.changed", handleLogoChange);
    };
  }, []);

  const getLogoUrl = useCallback(
    (skin: Skin = defaultSkin, small: boolean = false): string => {
      const resolvedSkin = skin ? skin : defaultSkin;
      const tenantId = tenant?.id;
      const date = Date.now();

      const suffix = small ? "-sm" : "";

      const tenantQuery = tenantId ? `&tenantId=${tenantId}` : "";
      return `${AppConsts.remoteServiceBaseUrl}/TenantCustomization/GetTenantLogo?skin=${resolvedSkin}${suffix}${tenantQuery}&c=${date}&r=${refreshKey}`;
    },
    [defaultSkin, tenant?.id, refreshKey],
  );

  const getDefaultLogoUrl = useCallback(
    (skin: Skin = defaultSkin, small: boolean = false): string => {
      const resolvedSkin = skin ? skin : defaultSkin;
      const suffix = small ? "-sm" : "";
      return `${AppConsts.appBaseUrl}/assets/common/images/app-logo-on-${resolvedSkin}${suffix}.svg`;
    },
    [defaultSkin],
  );

  return { getLogoUrl, getDefaultLogoUrl, skin: defaultSkin };
};
