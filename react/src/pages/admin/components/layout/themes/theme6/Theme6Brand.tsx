import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLogo } from "../../../common/logo/useLogo";

interface Props {
  anchorClass?: string;
  imageClass?: string;
}

const Theme6Brand: React.FC<Props> = ({
  anchorClass = "d-flex align-items-center",
  imageClass = "h-45px logo p-2",
}) => {
  const { getLogoUrl, getDefaultLogoUrl } = useLogo();
  const [fallbackSmall, setFallbackSmall] = useState(false);
  const [fallbackLarge, setFallbackLarge] = useState(false);

  const defaultSmallLogoUrl = useMemo(
    () => getDefaultLogoUrl("dark", true),
    [getDefaultLogoUrl],
  );
  const defaultLargeLogoUrl = useMemo(
    () => getDefaultLogoUrl(undefined, false),
    [getDefaultLogoUrl],
  );
  const tenantSmallLogoUrl = useMemo(
    () => getLogoUrl("dark", true),
    [getLogoUrl],
  );
  const tenantLargeLogoUrl = useMemo(
    () => getLogoUrl(undefined, false),
    [getLogoUrl],
  );

  const srcSmall = fallbackSmall ? defaultSmallLogoUrl : tenantSmallLogoUrl;
  const srcLarge = fallbackLarge ? defaultLargeLogoUrl : tenantLargeLogoUrl;

  return (
    <Link to="/app" className={anchorClass}>
      <img
        src={srcLarge}
        alt="logo"
        className={`${imageClass} d-lg-none`}
        onError={() => setFallbackLarge(true)}
      />
      <img
        src={srcSmall}
        alt="logo"
        className={`${imageClass} d-none d-lg-block`}
        onError={() => setFallbackSmall(true)}
      />
    </Link>
  );
};

export default Theme6Brand;
