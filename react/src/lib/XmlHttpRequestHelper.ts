type Headers = Record<string, string>;
type SuccessCallback = (result: unknown) => void;
type ErrorCallback = (error?: unknown) => void;

export const XmlHttpRequestHelper = {
  ajax: (
    type: string,
    url: string,
    customHeaders: Headers = {},
    data: unknown,
    success: SuccessCallback,
    error?: ErrorCallback,
  ) => {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            success(result);
          } catch (e) {
            error?.(e);
          }
        } else if (xhr.status !== 0) {
          if (error) {
            try {
              const result = JSON.parse(xhr.responseText);
              error(result);
            } catch (e) {
              error(e);
            }
          } else {
            alert(abp.localization.localize("InternalServerError", "AbpWeb"));
          }
        }
      }
    };

    // Add cache-busting query param
    url += (url.includes("?") ? "&" : "?") + "d=" + new Date().getTime();
    xhr.open(type, url, true);

    // Apply custom headers
    Object.keys(customHeaders).forEach((key) => {
      xhr.setRequestHeader(key, customHeaders[key]);
    });

    xhr.setRequestHeader("Content-type", "application/json");

    if (data) {
      xhr.send(typeof data === "string" ? data : JSON.stringify(data));
    } else {
      xhr.send();
    }

    xhr.onerror = () => {
      if (error) {
        error();
        return;
      }
      console.error("There was an error with the request.");
    };
  },
};
