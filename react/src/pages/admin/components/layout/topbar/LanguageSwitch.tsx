import React, { useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import {
  ProfileServiceProxy,
  ChangeUserLanguageDto,
} from "../../../../../api/generated/service-proxies";
import { useTranslation } from "react-i18next";
import { useServiceProxy } from "@/api/service-proxy-factory";

type LanguageInfo = {
  name: string;
  displayName: string;
  icon?: string;
  isDisabled?: boolean;
};

type Props = {
  languages?: LanguageInfo[];
  current?: LanguageInfo;
  className?: string;
  buttonClassName?: string;
  right?: boolean;
};

const LanguageSwitch: React.FC<Props> = ({
  languages,
  current,
  className,
  buttonClassName = "btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px position-relative",
  right = true,
}) => {
  const { i18n } = useTranslation();
  const profileService = useServiceProxy(ProfileServiceProxy, []);

  const resolveAbpLanguages = useMemo(() => {
    const cleaned = abp?.localization?.languages
      .filter((l) => l && l.isDisabled === false)
      .map((l) => ({
        name: String(l.name),
        displayName: String(l.displayName || l.name),
        icon: l.icon as string | undefined,
      })) as LanguageInfo[];
    return cleaned;
  }, []);

  const [langs, setLangs] = useState<LanguageInfo[]>(
    languages || resolveAbpLanguages,
  );

  const [currentLang, setCurrentLang] = useState<LanguageInfo>(() => {
    const byI18n = (languages || resolveAbpLanguages).find(
      (l) => l.name === i18n.language,
    );
    return current || byI18n || (languages || resolveAbpLanguages)[0];
  });

  useEffect(() => {
    if (languages && languages.length) setLangs(languages);
    else setLangs(resolveAbpLanguages);
  }, [languages, resolveAbpLanguages]);

  useEffect(() => {
    setCurrentLang(
      current || langs.find((l) => l.name === i18n.language) || langs[0],
    );
  }, [i18n.language, current, langs]);

  const changeLanguage = async (languageName: string) => {
    const input = new ChangeUserLanguageDto();
    input.languageName = languageName;
    await profileService.changeLanguage(input);

    abp?.utils?.setCookieValue?.(
      "Abp.Localization.CultureName",
      languageName,
      // eslint-disable-next-line react-hooks/purity
      new Date(Date.now() + 5 * 365 * 86400000),
      abp?.appPath,
    );
    window.location.reload();
  };

  if ((langs?.length || 0) <= 1) return null;

  return (
    <div
      className={classNames(
        "d-flex align-items-center ms-1 ms-lg-3 dropdown-language",
        className,
      )}
      data-kt-menu-trigger="click"
      data-kt-menu-placement={right ? "bottom-end" : "bottom-start"}
    >
      <div className={buttonClassName}>
        {currentLang?.icon ? (
          <i className={currentLang.icon} />
        ) : (
          <span className="fs-7 fw-bold">
            {currentLang?.displayName || currentLang?.name}
          </span>
        )}
      </div>
      <div
        className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-200px py-4"
        data-kt-menu="true"
      >
        {langs.map((l) => (
          <div className="menu-item px-3" key={l.name}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                void changeLanguage(l.name);
              }}
              className="menu-link px-3"
            >
              <span className="d-flex symbol symbol-20px me-4">
                {l.icon ? <i className={l.icon} /> : null}
              </span>
              {l.displayName}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitch;
