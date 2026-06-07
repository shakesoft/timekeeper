import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLogo } from "../../../common/logo/useLogo";

const Theme12Brand: React.FC = () => {
  const { getLogoUrl, getDefaultLogoUrl } = useLogo();
  const [fallbackLarge, setFallbackLarge] = useState(false);
  const [fallbackSmall, setFallbackSmall] = useState(false);

  const defaultLogoUrl = useMemo(
    () => getDefaultLogoUrl(),
    [getDefaultLogoUrl],
  );
  const defaultSmallLogoUrl = useMemo(
    () => getDefaultLogoUrl(undefined, true),
    [getDefaultLogoUrl],
  );
  const tenantLogoUrl = useMemo(() => getLogoUrl(), [getLogoUrl]);
  const tenantSmallLogoUrl = useMemo(
    () => getLogoUrl(undefined, true),
    [getLogoUrl],
  );

  return (
    <Link to="/app">
      <img
        alt="Logo"
        src={fallbackLarge ? defaultLogoUrl : tenantLogoUrl}
        className="d-none d-lg-block h-30px"
        onError={() => setFallbackLarge(true)}
      />
      <img
        alt="Logo"
        src={fallbackSmall ? defaultSmallLogoUrl : tenantSmallLogoUrl}
        className="d-lg-none h-25px"
        onError={() => setFallbackSmall(true)}
      />
    </Link>
  );
};

export default Theme12Brand;
