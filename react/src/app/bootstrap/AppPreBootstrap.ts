import { UrlHelper } from "../../lib/url-helper";
import { XmlHttpRequestHelper } from "../../lib/XmlHttpRequestHelper";
import AppConsts from "../../lib/app-consts";
import { hardLogout, setAuthTokens } from "../../lib/auth-helpers";

type AuthResponse = {
  result: {
    accessToken: string;
    encryptedAccessToken: string;
  };
};

export class AppPreBootstrap {
  static async run(callback: () => void): Promise<void> {
    // Get params from query string
    const queryStringObj = UrlHelper.getQueryParameters();

    if (
      queryStringObj.redirect &&
      queryStringObj.redirect === "TenantRegistration"
    ) {
      if (queryStringObj.forceNewRegistration) {
        hardLogout();
      }
      location.href = AppConsts.appBaseUrl + "/account/select-edition";
    } else if (queryStringObj.impersonationToken) {
      if (queryStringObj.userDelegationId) {
        AppPreBootstrap.delegatedImpersonatedAuthenticate(
          queryStringObj.userDelegationId,
          queryStringObj.impersonationToken,
          Number(queryStringObj.tenantId),
          () => {
            window.location.href = AppConsts.appBaseUrl + "/app";
          },
        );
      } else {
        AppPreBootstrap.impersonatedAuthenticate(
          queryStringObj.impersonationToken,
          Number(queryStringObj.tenantId),
          () => {
            window.location.href = AppConsts.appBaseUrl + "/app";
          },
        );
      }
    } else if (queryStringObj.switchAccountToken) {
      AppPreBootstrap.linkedAccountAuthenticate(
        queryStringObj.switchAccountToken,
        Number(queryStringObj.tenantId),
        () => {
          window.location.href = AppConsts.appBaseUrl + "/app";
        },
      );
    } else {
      if (callback) {
        callback();
      }
    }
  }

  static linkedAccountAuthenticate(
    switchAccountToken: string,
    tenantId: number,
    callback: () => void,
  ) {
    abp.multiTenancy.setTenantIdCookie(tenantId);
    const requestHeaders = AppPreBootstrap.getRequetHeadersWithDefaultValues();

    XmlHttpRequestHelper.ajax(
      "POST",
      AppConsts.remoteServiceBaseUrl +
        "/api/TokenAuth/LinkedAccountAuthenticate?switchAccountToken=" +
        switchAccountToken,
      requestHeaders,
      null,
      (response) => {
        const result = (response as AuthResponse).result;
        setAuthTokens(
          result.accessToken,
          result.encryptedAccessToken,
          callback,
        );
      },
    );
  }

  static impersonatedAuthenticate(
    impersonationToken: string,
    tenantId: number,
    callback: () => void,
  ) {
    abp.multiTenancy.setTenantIdCookie(tenantId);
    const requestHeaders = AppPreBootstrap.getRequetHeadersWithDefaultValues();

    XmlHttpRequestHelper.ajax(
      "POST",
      AppConsts.remoteServiceBaseUrl +
        "/api/TokenAuth/ImpersonatedAuthenticate?impersonationToken=" +
        impersonationToken,
      requestHeaders,
      null,
      (response) => {
        const result = (response as AuthResponse).result;
        setAuthTokens(
          result.accessToken,
          result.encryptedAccessToken,
          callback,
        );
      },
    );
  }

  static delegatedImpersonatedAuthenticate(
    userDelegationId: string,
    impersonationToken: string,
    tenantId: number,
    callback: () => void,
  ) {
    abp.multiTenancy.setTenantIdCookie(tenantId);
    const requestHeaders = AppPreBootstrap.getRequetHeadersWithDefaultValues();

    XmlHttpRequestHelper.ajax(
      "POST",
      AppConsts.remoteServiceBaseUrl +
        "/api/TokenAuth/DelegatedImpersonatedAuthenticate?userDelegationId=" +
        userDelegationId +
        "&impersonationToken=" +
        impersonationToken,
      requestHeaders,
      null,
      (response) => {
        const result = (response as AuthResponse).result;
        setAuthTokens(
          result.accessToken,
          result.encryptedAccessToken,
          callback,
        );
      },
    );
  }

  static getRequetHeadersWithDefaultValues() {
    const cookieLangValue = abp.utils.getCookieValue(
      "Abp.Localization.CultureName",
    );

    const requestHeaders: Record<string, string> = {};

    if (cookieLangValue) {
      requestHeaders[".AspNetCore.Culture"] =
        "c=" + cookieLangValue + "|uic=" + cookieLangValue;
    }

    const tenantId = abp.multiTenancy.getTenantIdCookie();
    if (tenantId) {
      requestHeaders[abp.multiTenancy.tenantIdCookieName] = String(tenantId);
    }

    return requestHeaders;
  }
}
