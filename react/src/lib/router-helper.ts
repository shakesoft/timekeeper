import React from "react";

export function getCurrentUrl(pathname: string) {
  return pathname.split(/[?#]/)[0];
}

export function checkIsActive(pathname: string, url: string) {
  const current = getCurrentUrl(pathname);
  if (!current || !url) {
    return false;
  }

  if (current === url) {
    return true;
  }

  if (current.indexOf(url) > -1) {
    return true;
  }

  return false;
}

export function hasActiveChild(
  pathname: string,
  children: React.ReactNode,
): boolean {
  let hasActive = false;

  React.Children.forEach(children, (child) => {
    if (hasActive) return;

    if (!React.isValidElement(child)) return;

    const childProps = child.props as {
      to?: string;
      children?: React.ReactNode;
    };
    if (childProps?.to && checkIsActive(pathname, childProps.to)) {
      hasActive = true;
      return;
    }

    if (childProps?.children) {
      hasActive = hasActiveChild(pathname, childProps.children);
    }
  });

  return hasActive;
}
