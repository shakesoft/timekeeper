export const UrlHelper = {
  initialUrl: window.location.href,

  getQueryParameters(): Record<string, string> {
    return UrlHelper.getQueryParametersUsingParameters(window.location.search);
  },

  getQueryParametersUsingParameters(search: string): Record<string, string> {
    if (!search) return {};

    return search
      .replace(/^\?/, "")
      .split("&")
      .reduce<Record<string, string>>((acc, n) => {
        const [key, value] = n.split("=");
        if (key) {
          acc[key] = value ?? "";
        }
        return acc;
      }, {});
  },

  getQueryParametersUsingHash(): Record<string, string> {
    const hash = window.location.hash.substring(1); // remove leading #
    if (!hash) return {};

    return hash
      .replace(/^\?/, "")
      .split("&")
      .reduce<Record<string, string>>((acc, n) => {
        const [key, value] = n.split("=");
        if (key) {
          acc[key] = value ?? "";
        }
        return acc;
      }, {});
  },

  getInitialUrlParameters(): string {
    const questionMarkIndex = UrlHelper.initialUrl.indexOf("?");
    if (questionMarkIndex >= 0) {
      return UrlHelper.initialUrl.substring(questionMarkIndex);
    }
    return "";
  },

  getReturnUrl(): string | null {
    const queryStringObj = UrlHelper.getQueryParametersUsingParameters(
      UrlHelper.getInitialUrlParameters(),
    );
    if (queryStringObj.returnUrl) {
      return decodeURIComponent(queryStringObj.returnUrl);
    }
    return null;
  },

  getSingleSignIn(): string | false {
    const queryStringObj = UrlHelper.getQueryParametersUsingParameters(
      UrlHelper.getInitialUrlParameters(),
    );
    return queryStringObj.ss || false;
  },

  isInstallUrl(url?: string): boolean {
    return !!url && url.includes("account/install");
  },
};
