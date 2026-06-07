import React, { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLogo } from "../../../common/logo/useLogo";

const Theme8Brand: React.FC = () => {
  const { getLogoUrl, getDefaultLogoUrl } = useLogo();
  const [fallback, setFallback] = useState(false);

  const defaultLogoUrl = useMemo(
    () => getDefaultLogoUrl("dark"),
    [getDefaultLogoUrl],
  );
  const tenantLogoUrl = useMemo(() => getLogoUrl("dark"), [getLogoUrl]);

  const src = fallback ? defaultLogoUrl : tenantLogoUrl;

  const onError = useCallback(() => setFallback(true), []);

  return (
    <Link to="/app">
      <img
        src={src}
        alt="logo"
        className="h-25px h-lg-25px"
        onError={onError}
      />
    </Link>
  );
};

export default Theme8Brand;
