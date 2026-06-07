import React, { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLogo } from "../../../common/logo/useLogo";

interface Props {
  imageClass?: string;
}

const Theme9Brand: React.FC<Props> = ({ imageClass = "h-40px" }) => {
  const { getLogoUrl, getDefaultLogoUrl } = useLogo();
  const [fallback, setFallback] = useState(false);

  const defaultLogoUrl = useMemo(
    () => getDefaultLogoUrl(undefined, false),
    [getDefaultLogoUrl],
  );
  const tenantLogoUrl = useMemo(
    () => getLogoUrl(undefined, false),
    [getLogoUrl],
  );

  const src = fallback ? defaultLogoUrl : tenantLogoUrl;
  const onError = useCallback(() => setFallback(true), []);

  return (
    <Link to="/app">
      <img alt="Logo" src={src} className={imageClass} onError={onError} />
    </Link>
  );
};

export default Theme9Brand;
