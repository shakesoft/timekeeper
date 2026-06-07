import React, { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLogo } from "../../../common/logo/useLogo";

const Theme11Brand: React.FC = () => {
  const { getLogoUrl, getDefaultLogoUrl } = useLogo();
  const [fallback, setFallback] = useState(false);

  const defaultLogoUrl = useMemo(
    () => getDefaultLogoUrl(),
    [getDefaultLogoUrl],
  );
  const tenantLogoUrl = useMemo(() => getLogoUrl(), [getLogoUrl]);

  const src = fallback ? defaultLogoUrl : tenantLogoUrl;

  const onError = useCallback(() => setFallback(true), []);

  return (
    <Link to="/app">
      <img
        src={src}
        alt="logo"
        className="h-20px h-lg-30px"
        onError={onError}
      />
    </Link>
  );
};

export default Theme11Brand;
