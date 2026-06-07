import React, { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLogo } from "../../../common/logo/useLogo";

interface Props {
  imageClass?: string;
}

const Theme7Brand: React.FC<Props> = ({ imageClass = "h-35px p-1" }) => {
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
      <img src={src} alt="logo" className={imageClass} onError={onError} />
    </Link>
  );
};

export default Theme7Brand;
