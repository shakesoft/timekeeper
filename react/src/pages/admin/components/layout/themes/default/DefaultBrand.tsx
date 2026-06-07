import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLogo } from "../../../common/logo/useLogo";

const DefaultBrand: React.FC = () => {
  const { getLogoUrl, getDefaultLogoUrl } = useLogo();
  const [fallbackLarge, setFallbackLarge] = useState(false);
  const [fallbackSmall, setFallbackSmall] = useState(false);

  const largeLogoUrl = useMemo(() => {
    return fallbackLarge
      ? getDefaultLogoUrl(undefined, false)
      : getLogoUrl(undefined, false);
  }, [fallbackLarge, getDefaultLogoUrl, getLogoUrl]);

  const smallLogoUrl = useMemo(() => {
    return fallbackSmall
      ? getDefaultLogoUrl(undefined, true)
      : getLogoUrl(undefined, true);
  }, [fallbackSmall, getDefaultLogoUrl, getLogoUrl]);

  return (
    <Link to="/app">
      <img
        src={largeLogoUrl}
        alt="Logo"
        className="h-25px app-sidebar-logo-default"
        onError={() => setFallbackLarge(true)}
      />
      <img
        src={smallLogoUrl}
        alt="Logo"
        className="h-20px app-sidebar-logo-minimize"
        onError={() => setFallbackSmall(true)}
      />
    </Link>
  );
};

export default DefaultBrand;
