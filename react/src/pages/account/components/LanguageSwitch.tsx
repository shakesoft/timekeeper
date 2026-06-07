import React, { useEffect, useMemo, useState } from "react";
import classNames from "classnames";

type Props = {
  className?: string;
  buttonClassName?: string;
};

const AccountLanguageSwitch: React.FC<Props> = ({ className }) => {
  type Language = {
    name: string;
    displayName: string;
    icon?: string;
    isDisabled?: boolean;
  };
  const [languages, setLanguages] = useState<Language[]>([]);

  const currentLanguage = useMemo(() => abp?.localization?.currentLanguage, []);

  useEffect(() => {
    const list = (abp?.localization?.languages || [])
      .filter(
        (l: {
          name?: unknown;
          displayName?: unknown;
          icon?: unknown;
          isDisabled?: unknown;
        }) => l && l.isDisabled === false,
      )
      .map(
        (l: {
          name?: unknown;
          displayName?: unknown;
          icon?: unknown;
          isDisabled?: unknown;
        }) => ({
          name: String(l.name),
          displayName: String(l.displayName || l.name),
          icon: l.icon as string | undefined,
          isDisabled: !!l.isDisabled,
        }),
      );
    setLanguages(list);
  }, []);

  const changeLanguage = (languageName: string) => {
    abp?.utils?.setCookieValue?.(
      "Abp.Localization.CultureName",
      languageName,
      // eslint-disable-next-line react-hooks/purity
      new Date(Date.now() + 5 * 365 * 86400000),
      abp?.appPath,
    );
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `.AspNetCore.Culture=c=${languageName}|uic=${languageName}; path=/; expires=${new Date(
      // eslint-disable-next-line react-hooks/purity
      Date.now() + 5 * 365 * 86400000,
    ).toUTCString()}`;
    window.location.reload();
  };

  if ((languages?.length || 0) <= 1) return null;

  return (
    <div
      className={classNames(
        "ms-1 mx-auto d-flex align-items-center",
        className,
      )}
      style={{ gap: 8 }}
    >
      {languages.map((l) => (
        <button
          key={l.name}
          type="button"
          title={l.displayName}
          aria-label={l.displayName}
          className={classNames(
            "btn language-switch-btn btn-clean btn-icon p-0 me-0",
            l.name === currentLanguage?.name && "active",
          )}
          style={{ width: "auto", height: "auto" }}
          onClick={() => changeLanguage(l.name)}
        >
          {l.icon ? (
            <i className={l.icon} aria-hidden="true" />
          ) : (
            <span className="fs-7 fw-bold">{l.displayName}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default AccountLanguageSwitch;
