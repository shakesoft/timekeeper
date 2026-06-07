import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLogo } from "../../../common/logo/useLogo";

const Theme2Brand: React.FC = () => {
  const { getLogoUrl, getDefaultLogoUrl } = useLogo();
  const [fallbackLarge, setFallbackLarge] = useState(false);
  const [fallbackSmall, setFallbackSmall] = useState(false);

  const largeLogoUrl = useMemo(() => {
    return fallbackLarge
      ? getDefaultLogoUrl("dark", false)
      : getLogoUrl("dark", false);
  }, [fallbackLarge, getDefaultLogoUrl, getLogoUrl]);

  const smallLogoUrl = useMemo(() => {
    return fallbackSmall
      ? getDefaultLogoUrl("dark", true)
      : getLogoUrl("dark", true);
  }, [fallbackSmall, getDefaultLogoUrl, getLogoUrl]);

  return (
    <div className="header-logo me-5 me-md-10">
      <Link to="/app">
        <img
          alt="Logo"
          src={largeLogoUrl}
          className="logo-default h-25px"
          height={38}
          onError={() => setFallbackLarge(true)}
        />
        <img
          alt="Logo"
          src={smallLogoUrl}
          className="logo-sticky h-25px"
          height={38}
          onError={() => setFallbackSmall(true)}
        />
      </Link>
    </div>
  );
};

export default Theme2Brand;
