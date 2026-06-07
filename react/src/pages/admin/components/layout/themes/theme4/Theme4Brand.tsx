import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLogo } from "../../../common/logo/useLogo";

interface Props {
  customStyle?: string;
}

const Theme4Brand: React.FC<Props> = ({ customStyle = "h-55px" }) => {
  const { getLogoUrl, getDefaultLogoUrl } = useLogo();
  const [fallbackDesktopSmall, setFallbackDesktopSmall] = useState(false);
  const [fallbackMobileLarge, setFallbackMobileLarge] = useState(false);

  const defaultSmallDarkUrl = useMemo(
    () => getDefaultLogoUrl("dark", true),
    [getDefaultLogoUrl],
  );
  const tenantSmallDarkUrl = useMemo(
    () => getLogoUrl("dark", true),
    [getLogoUrl],
  );
  const desktopSmallSrc = fallbackDesktopSmall
    ? defaultSmallDarkUrl
    : tenantSmallDarkUrl;

  const defaultLargeUrl = useMemo(
    () => getDefaultLogoUrl("light", false),
    [getDefaultLogoUrl],
  );
  const tenantLargeUrl = useMemo(
    () => getLogoUrl("light", false),
    [getLogoUrl],
  );
  const mobileLargeSrc = fallbackMobileLarge ? defaultLargeUrl : tenantLargeUrl;

  return (
    <Link to="/app">
      <img
        src={mobileLargeSrc}
        alt="logo"
        className={`${customStyle} d-lg-none`}
        onError={() => setFallbackMobileLarge(true)}
      />
      <img
        src={desktopSmallSrc}
        alt="logo"
        className={`h-50px d-none d-lg-block`}
        onError={() => setFallbackDesktopSmall(true)}
      />
    </Link>
  );
};

export default Theme4Brand;
