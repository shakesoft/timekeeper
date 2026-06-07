import React, { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLogo } from "../../../common/logo/useLogo";

interface Props {
  anchorClass?: string;
  imageClass?: string;
}

const Theme13Brand: React.FC<Props> = ({
  anchorClass = "",
  imageClass = "h-25px logo",
}) => {
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
    <Link to="/app" className={anchorClass}>
      <img alt="Logo" src={src} className={imageClass} onError={onError} />
    </Link>
  );
};

export default Theme13Brand;
