import React, { useCallback, useEffect, useState } from "react";
import {
  AuthenticateModel,
  ExternalLoginProviderInfoModel,
  ProfileServiceProxy,
} from "@api/generated/service-proxies";
import { useLoginService } from "../login.service";
import AppConsts from "@/lib/app-consts";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

type UserInfoCookie = {
  userName: string;
  tenant?: string | null;
  externalLoginProviderName?: string | null;
};

function getCookieValue(name: string): string | null {
  try {
    const v = abp?.utils?.getCookieValue?.(name);
    if (typeof v === "string") return v;
  } catch {
    abp.message?.error?.(L("AnErrorOccurred"));
  }
  try {
    const match = document.cookie.match(
      new RegExp(
        "(?:^|; )" + name.replace(/([.$?*|{}()[\]/+^])/g, "\\$1") + "=([^;]*)",
      ),
    );
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    abp.message?.error?.(L("AnErrorOccurred"));
    return null;
  }
}

const defaultProfile = `${AppConsts.appBaseUrl}/assets/common/images/default-profile-picture.png`;

const SessionLockScreen: React.FC = () => {
  const profileService = useServiceProxy(ProfileServiceProxy, []);
  const {
    authenticate,
    initExternalLoginProviders,
    externalLoginProviders,
    startExternalLogin,
  } = useLoginService();

  const [userNameOrEmailAddress, setUserNameOrEmailAddress] = useState("");
  const [tenant, setTenant] = useState<string>("");
  const [externalLoginProviderName, setExternalLoginProviderName] = useState<
    string | null
  >(null);
  const [isExternalLoginEnabled, setIsExternalLoginEnabled] =
    useState<boolean>(false);
  const [profilePicture, setProfilePicture] = useState<string>(defaultProfile);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const cookie = getCookieValue("userInfo");
    if (!cookie) {
      window.location.href = "/";
      return;
    }
    let parsed: UserInfoCookie | null = null;
    try {
      parsed = JSON.parse(cookie) as UserInfoCookie;
    } catch {
      abp.message?.error?.(L("AnErrorOccurred"));
    }
    if (!parsed || !parsed.userName) {
      window.location.href = "/";
      return;
    }
    setUserNameOrEmailAddress(parsed.userName);
    setTenant(parsed.tenant || "");
    setExternalLoginProviderName(parsed.externalLoginProviderName || null);
    setIsExternalLoginEnabled(!!parsed.externalLoginProviderName);
  }, []);

  useEffect(() => {
    if (!userNameOrEmailAddress) return;
    let cancelled = false;
    profileService
      .getProfilePictureByUserName(userNameOrEmailAddress)
      .then((res) => {
        if (cancelled) return;
        if (res?.profilePicture) {
          setProfilePicture(`data:image/jpeg;base64,${res.profilePicture}`);
        } else {
          setProfilePicture(defaultProfile);
        }
      })
      .catch(() => setProfilePicture(defaultProfile));
    return () => {
      cancelled = true;
    };
  }, [profileService, userNameOrEmailAddress]);

  useEffect(() => {
    initExternalLoginProviders();
  }, [initExternalLoginProviders]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!userNameOrEmailAddress || !password) return;
      setSubmitting(true);
      try {
        const model = new AuthenticateModel();
        model.userNameOrEmailAddress = userNameOrEmailAddress;
        model.password = password;
        model.rememberClient = rememberMe;
        await authenticate(model);
      } finally {
        setSubmitting(false);
      }
    },
    [authenticate, password, rememberMe, userNameOrEmailAddress],
  );

  const onExternalLogin = useCallback(() => {
    if (!externalLoginProviderName) return;
    const found = (externalLoginProviders || []).find(
      (p) => p.name === externalLoginProviderName,
    ) as ExternalLoginProviderInfoModel | undefined;
    if (found) startExternalLogin(found);
  }, [externalLoginProviderName, externalLoginProviders, startExternalLogin]);

  return (
    <div className="card card-bordered gutter-b card-stretch">
      <div className="card-body text-center pt-4">
        <div className="alert bg-light-primary" role="alert">
          <div className="alert-text" style={{ fontWeight: "bold" }}>
            {L("YourSessionIsLocked")}
            <i className="fa fa-lock float-end mt-1 me-5" />
          </div>
        </div>

        <div className="mt-7 pb-2">
          <div className="symbol symbol-circle symbol-lg-75">
            <img
              className="symbol-label"
              src={profilePicture}
              alt="profileimage"
            />
          </div>
        </div>

        <div className="my-2">
          <a
            href="#"
            className="text-gray-900 fw-bold text-hover-primary fs-h4"
            onClick={(e) => e.preventDefault()}
          >
            {userNameOrEmailAddress}
          </a>
        </div>

        <div className="my-2">
          <span className="text-gray-900 fw-normal fs-h4">
            Tenant: <span className="text-gray-900 fw-bold">{tenant}</span>
          </span>
        </div>

        {isExternalLoginEnabled ? (
          <form
            className="form mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              onExternalLogin();
            }}
          >
            <div className="my-4">
              <button
                type="submit"
                className="btn btn-primary fw-bolder fs-h6 col-5"
              >
                {L("LogIn")}
              </button>
            </div>
          </form>
        ) : (
          <form className="form mt-4" onSubmit={onSubmit}>
            <div className="my-2">
              <div className="mb-5">
                <input
                  type="hidden"
                  name="usernameOrEmailAddress"
                  value={userNameOrEmailAddress}
                  readOnly
                />
              </div>
              <div className="mb-5">
                <input
                  className="form-control form-control-solid h-auto py-7 px-6 rounded-lg fs-h6"
                  type="password"
                  autoComplete="new-password"
                  placeholder={`${L("Password")}*`}
                  name="password"
                  value={password}
                  maxLength={32}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mt-9 mb-6 clearfix">
              <div className="col-5 mt-2 float-start">
                <label className="form-check form-check-custom form-check-solid py-1">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    className="form-check-input"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    value="true"
                  />
                  <span className="form-check-label">{L("RememberMe")}</span>
                </label>
              </div>
              <button
                type="submit"
                className="btn btn-primary fw-bolder fs-h6 col-5 float-end"
                disabled={!password || submitting}
              >
                {L("LogIn")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SessionLockScreen;
