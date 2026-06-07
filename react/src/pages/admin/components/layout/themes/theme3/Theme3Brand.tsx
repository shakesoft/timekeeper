import React, { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLogo } from "../../../common/logo/useLogo";

interface Props {
  logoSize?: "sm" | "md" | "lg";
}

const sizeToClass: Record<NonNullable<Props["logoSize"]>, string> = {
  sm: "h-25px",
  md: "h-30px",
  lg: "h-40px",
};

const Theme3Brand: React.FC<Props> = ({ logoSize = "md" }) => {
  const { getLogoUrl, getDefaultLogoUrl } = useLogo();
  const [useFallback, setUseFallback] = useState(false);

  const tenantLogoUrl = useMemo(
    () => getLogoUrl(undefined, logoSize === "sm"),
    [getLogoUrl, logoSize],
  );
  const defaultLogoUrl = useMemo(
    () => getDefaultLogoUrl(undefined, logoSize === "sm"),
    [getDefaultLogoUrl, logoSize],
  );

  const onImgError = useCallback(() => setUseFallback(true), []);

  const cls = sizeToClass[logoSize];

  return (
    <Link to="/app">
      <img
        src={useFallback ? defaultLogoUrl : tenantLogoUrl}
        alt="logo"
        className={`${cls} logo`}
        onError={onImgError}
      />
    </Link>
  );
};

export default Theme3Brand;
