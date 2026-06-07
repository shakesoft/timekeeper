// $.isFunction was removed in jQuery 4.x but abp-web-resources still relies on it.
// This polyfill must be imported before abp-web-resources.
import $ from "jquery";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const any$ = $ as any;
if (!any$.isFunction) {
  any$.isFunction = (obj: unknown): boolean => typeof obj === "function";
}
