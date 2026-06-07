import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLogo } from "../../../common/logo/useLogo";

const Theme5Brand: React.FC = () => {
  const { getLogoUrl, getDefaultLogoUrl } = useLogo();
  const [fallbackLarge, setFallbackLarge] = useState(false);

  const defaultLogoUrl = useMemo(
    () => getDefaultLogoUrl(undefined, false),
    [getDefaultLogoUrl],
  );

  const tenantLogoUrl = useMemo(
    () => getLogoUrl(undefined, false),
    [getLogoUrl],
  );

  return (
    <Link to="/app">
      <img
        src={fallbackLarge ? defaultLogoUrl : tenantLogoUrl}
        alt="logo"
        className="d-lg-inline h-30px"
        onError={() => setFallbackLarge(true)}
      />
    </Link>
  );
};

export default Theme5Brand;
