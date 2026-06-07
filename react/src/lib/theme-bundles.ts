const THEME_BASE_PATH = "/metronic/themes";
const CUSTOMIZE_BASE_PATH = "/assets/common/styles/themes";

function buildStyleHref(themeName: string): string {
  return `${THEME_BASE_PATH}/${themeName}/css/style.bundle.css`;
}

function buildPluginsCssHref(themeName: string): string {
  return `${THEME_BASE_PATH}/${themeName}/plugins/global/plugins.bundle.css`;
}

function buildCustomizeHref(themeName: string): string {
  return `${CUSTOMIZE_BASE_PATH}/${themeName}/metronic-customize.css`;
}

function withCacheBuster(href: string): string {
  const cacheBust = `v=${Date.now()}`;
  return href.includes("?") ? `${href}&${cacheBust}` : `${href}?${cacheBust}`;
}

function findExistingThemeLink(
  kind: "style" | "plugins",
): HTMLLinkElement | null {
  const links = Array.from(
    document.querySelectorAll<HTMLLinkElement>("link[rel=stylesheet]"),
  );
  const matcher =
    kind === "style"
      ? "/css/style.bundle.css"
      : "/plugins/global/plugins.bundle.css";
  for (const link of links) {
    const href = link.getAttribute("href") || "";
    if (href.includes("/metronic/themes/") && href.includes(matcher)) {
      return link;
    }
  }
  return null;
}

function findExistingCustomizeLink(): HTMLLinkElement | null {
  return document.querySelector<HTMLLinkElement>(
    "link[data-kt-customize='true']",
  );
}

function createThemeLink(
  kind: "style" | "plugins",
  href: string,
): HTMLLinkElement {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.ktThemeKind = kind;
  return link;
}

function createCustomizeLink(href: string): HTMLLinkElement {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.ktCustomize = "true";
  return link;
}

function swapStylesheet(
  existing: HTMLLinkElement | null,
  nextHref: string,
  kind: "style" | "plugins",
): void {
  const nextHrefBusted = withCacheBuster(nextHref);
  if (!existing) {
    const nextLink = createThemeLink(kind, nextHrefBusted);
    document.head.appendChild(nextLink);
    return;
  }

  const replacement = createThemeLink(kind, nextHrefBusted);
  replacement.addEventListener("load", () => {
    if (existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  });

  existing.insertAdjacentElement("afterend", replacement);
}

function swapCustomizeStylesheet(
  existing: HTMLLinkElement | null,
  nextHref: string,
): void {
  const nextHrefBusted = withCacheBuster(nextHref);
  if (!existing) {
    const nextLink = createCustomizeLink(nextHrefBusted);
    document.head.appendChild(nextLink);
    return;
  }
  const replacement = createCustomizeLink(nextHrefBusted);
  replacement.addEventListener("load", () => {
    if (existing.parentNode) existing.parentNode.removeChild(existing);
  });
  existing.insertAdjacentElement("afterend", replacement);
}

export function updateMetronicThemeBundles(themeName: string): void {
  if (typeof document === "undefined") return;
  if (!themeName) return;

  try {
    localStorage.setItem("appTheme", themeName);
  } catch {
    // Ignore localStorage errors
  }

  const styleHref = buildStyleHref(themeName);
  const pluginsCssHref = buildPluginsCssHref(themeName);
  const customizeHref = buildCustomizeHref(themeName);

  const existingStyle = findExistingThemeLink("style");
  const existingPlugins = findExistingThemeLink("plugins");
  const existingCustomize = findExistingCustomizeLink();

  swapStylesheet(existingStyle, styleHref, "style");
  swapStylesheet(existingPlugins, pluginsCssHref, "plugins");
  swapCustomizeStylesheet(existingCustomize, customizeHref);
}

export function getActiveThemeFromStorage(): string {
  try {
    return localStorage.getItem("appTheme") || "default";
  } catch {
    return "default";
  }
}
