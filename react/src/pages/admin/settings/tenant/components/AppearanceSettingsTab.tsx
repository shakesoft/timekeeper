import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  RefObject,
} from "react";
import { TenantSettingsServiceProxy } from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import { useAuth } from "@/hooks/useAuth";
import AppConsts from "@/lib/app-consts";
import L from "@/lib/L";

const AppearanceSettingsTab: React.FC = () => {
  const tenantSettingsService = useServiceProxy(TenantSettingsServiceProxy, []);
  const { token } = useAuth();

  const [darkLogoUrl, setDarkLogoUrl] = useState<string>("");
  const [darkSmallLogoUrl, setDarkSmallLogoUrl] = useState<string>("");
  const [lightLogoUrl, setLightLogoUrl] = useState<string>("");
  const [lightSmallLogoUrl, setLightSmallLogoUrl] = useState<string>("");
  const [hasCustomCss, setHasCustomCss] = useState<boolean>(false);

  const darkLogoInputRef = useRef<HTMLInputElement>(null);
  const darkSmallLogoInputRef = useRef<HTMLInputElement>(null);
  const lightLogoInputRef = useRef<HTMLInputElement>(null);
  const lightSmallLogoInputRef = useRef<HTMLInputElement>(null);
  const customCssInputRef = useRef<HTMLInputElement>(null);

  const getLogoUrl = (skin: string) => {
    const tenantId = abp.session.tenantId;
    const timestamp = Date.now();
    return `${AppConsts.remoteServiceBaseUrl}/TenantCustomization/GetTenantLogo/${skin}?tenantId=${tenantId}&cb=${timestamp}`;
  };

  const setLogoUrlBySkin = (skin: string) => {
    const logoUrls: { [key: string]: (url: string) => void } = {
      dark: setDarkLogoUrl,
      "dark-sm": setDarkSmallLogoUrl,
      light: setLightLogoUrl,
      "light-sm": setLightSmallLogoUrl,
    };

    const setLogoFunc = logoUrls[skin];
    if (setLogoFunc) {
      setLogoFunc(getLogoUrl(skin));
    }
  };

  const refreshLogos = useCallback(() => {
    setDarkLogoUrl(getLogoUrl("dark"));
    setDarkSmallLogoUrl(getLogoUrl("dark-sm"));
    setLightLogoUrl(getLogoUrl("light"));
    setLightSmallLogoUrl(getLogoUrl("light-sm"));
  }, []);

  useEffect(() => {
    refreshLogos();
    const exists = !!document.getElementById("TenantCustomCss");
    setHasCustomCss(exists);
  }, [refreshLogos]);

  const handleFileUpload = async (
    file: File,
    url: string,
    inputRef: RefObject<HTMLInputElement | null>,
    skin?: string,
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${AppConsts.remoteServiceBaseUrl}${url}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        abp.message.success(L("SavedSuccessfully"));

        if (url.includes("UploadCustomCss")) {
          const oldEl = document.getElementById("TenantCustomCss");
          if (oldEl) oldEl.remove();
          const tenantId = abp.session.tenantId;
          const el = document.createElement("link");
          el.setAttribute("id", "TenantCustomCss");
          el.setAttribute("rel", "stylesheet");
          el.setAttribute(
            "href",
            `${
              AppConsts.remoteServiceBaseUrl
            }/TenantCustomization/GetCustomCss?tenantId=${tenantId}&cb=${Date.now()}`,
          );
          document.head.appendChild(el);
          setHasCustomCss(true);
        } else if (skin) {
          setLogoUrlBySkin(skin);
          abp.event.trigger("app.logo.changed", { skin });
        }
      } else if (result.error?.message) {
        abp.message.error(result.error.message);
      }
    } catch {
      abp.message.error(L("AnErrorOccurred"));
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const clearLogo = async (clearFunc: () => Promise<void>, skin: string) => {
    await clearFunc();
    abp.message.success(L("ClearedSuccessfully"));
    setLogoUrlBySkin(skin);
    abp.event.trigger("app.logo.changed", { skin });
  };

  const clearCustomCss = async () => {
    await tenantSettingsService.clearCustomCss();
    const oldEl = document.getElementById("TenantCustomCss");
    if (oldEl) oldEl.remove();
    setHasCustomCss(false);
    abp.message.success(L("ClearedSuccessfully"));
  };

  return (
    <div className="row m-form">
      <div className="col-md-6">
        <div className="col-md-8 p-3 upload-logo-dark border border-3">
          <h6 className="mt-5">{L("ApplicationDarkLogo")}</h6>
          <form>
            <div className="row mx-0">
              <div className="mb-5 brand-dark-logo-preview-area pl-0 col p-2">
                <a href={darkLogoUrl} target="_blank" rel="noreferrer">
                  {darkLogoUrl && <img height="38" src={darkLogoUrl} alt="Dark Logo" />}
                </a>
              </div>
              <div className="col text-end">
                <input
                  type="file"
                  ref={darkLogoInputRef}
                  accept=".png,.jpg,.jpeg,.gif"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(
                        file,
                        "/TenantCustomization/UploadDarkLogo",
                        darkLogoInputRef,
                        "dark",
                      );
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    darkLogoInputRef.current?.click();
                  }}
                >
                  {L("Change")}
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() =>
                    clearLogo(
                      () => tenantSettingsService.clearDarkLogo(),
                      "dark",
                    )
                  }
                >
                  {L("Reset")}
                </button>
              </div>
            </div>
          </form>
          <h6 className="mt-5">{L("ApplicationDarkIcon")}</h6>
          <form>
            <div className="row mx-0">
              <div className="mb-5 brand-dark-logo-preview-area pl-0 col p-2">
                <a href={darkSmallLogoUrl} target="_blank" rel="noreferrer">
                  {darkSmallLogoUrl && <img height="38" src={darkSmallLogoUrl} alt="Dark Icon" />}
                </a>
              </div>
              <div className="col text-end">
                <input
                  type="file"
                  ref={darkSmallLogoInputRef}
                  accept=".png,.jpg,.jpeg,.gif"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(
                        file,
                        "/TenantCustomization/UploadDarkLogoMinimal",
                        darkSmallLogoInputRef,
                        "dark-sm",
                      );
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    darkSmallLogoInputRef.current?.click();
                  }}
                >
                  {L("Change")}
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() =>
                    clearLogo(
                      () => tenantSettingsService.clearDarkLogoMinimal(),
                      "dark-sm",
                    )
                  }
                >
                  {L("Reset")}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="col-md-6">
        <div className="col-md-8 p-3 upload-logo-light border border-3">
          <h6 className="mt-5">{L("ApplicationLightLogo")}</h6>
          <form>
            <div className="row mx-0">
              <div className="mb-5 brand-light-logo-preview-area pl-0 col p-2">
                <a href={lightLogoUrl} target="_blank" rel="noreferrer">
                  {lightLogoUrl && <img height="38" src={lightLogoUrl} alt="Light Logo" />}
                </a>
              </div>
              <div className="col text-end">
                <input
                  type="file"
                  ref={lightLogoInputRef}
                  accept=".png,.jpg,.jpeg,.gif"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(
                        file,
                        "/TenantCustomization/UploadLightLogo",
                        lightLogoInputRef,
                        "light",
                      );
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    lightLogoInputRef.current?.click();
                  }}
                >
                  {L("Change")}
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() =>
                    clearLogo(
                      () => tenantSettingsService.clearLightLogo(),
                      "light",
                    )
                  }
                >
                  {L("Reset")}
                </button>
              </div>
            </div>
          </form>
          <h6 className="mt-5">{L("ApplicationLightIcon")}</h6>
          <form>
            <div className="row mx-0">
              <div className="mb-5 brand-light-logo-preview-area pl-0 col p-2">
                <a href={lightSmallLogoUrl} target="_blank" rel="noreferrer">
                  {lightSmallLogoUrl && <img height="38" src={lightSmallLogoUrl} alt="Light Icon" />}
                </a>
              </div>
              <div className="col text-end">
                <input
                  type="file"
                  ref={lightSmallLogoInputRef}
                  accept=".png,.jpg,.jpeg,.gif"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(
                        file,
                        "/TenantCustomization/UploadLightLogoMinimal",
                        lightSmallLogoInputRef,
                        "light-sm",
                      );
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    lightSmallLogoInputRef.current?.click();
                  }}
                >
                  {L("Change")}
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() =>
                    clearLogo(
                      () => tenantSettingsService.clearLightLogoMinimal(),
                      "light-sm",
                    )
                  }
                >
                  {L("Reset")}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="row m-form mt-8">
        <div className="col-md-6">
          <h5 className="mt-5">{L("CustomCSS")}</h5>
          {hasCustomCss ? (
            <div>
              <a
                className="btn btn-primary"
                href={`${AppConsts.remoteServiceBaseUrl}/TenantCustomization/GetCustomCss`}
                target="_blank"
                rel="noreferrer"
              >
                {L("Download")}
              </a>
              <button
                className="btn btn-default"
                type="button"
                onClick={clearCustomCss}
              >
                {L("Clear")}
              </button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                ref={customCssInputRef}
                accept=".css"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(
                      file,
                      "/TenantCustomization/UploadCustomCss",
                      customCssInputRef,
                    );
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  customCssInputRef.current?.click();
                }}
              >
                {L("Upload")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettingsTab;
