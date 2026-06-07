import apiHttp from "./http-client";
import AppConsts from "../lib/app-consts";
export * from "./generated/service-proxies";
import { useMemo, type DependencyList } from "react";
import type { AxiosInstance } from "axios";

function resolveBaseUrl(explicit?: string) {
  const url = explicit || AppConsts.remoteServiceBaseUrl || "";
  return url ? url.replace(/\/$/, "") : "";
}

export type ServiceProxyConstructor<T> = new (
  baseUrl?: string,
  instance?: AxiosInstance,
) => T;

export function proxy<T>(
  Ctor: ServiceProxyConstructor<T>,
  baseUrl?: string,
): T {
  return new Ctor(resolveBaseUrl(baseUrl), apiHttp());
}

export const createServiceProxy = proxy;

export function useServiceProxy<T>(
  Ctor: ServiceProxyConstructor<T>,
  deps: DependencyList = [],
  baseUrl?: string,
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => proxy(Ctor, baseUrl), deps);
}
