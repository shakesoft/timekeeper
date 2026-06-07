import AppConsts from "@/lib/app-consts";
import { apiHttp } from "./http-client";

export interface AbpUserConfigurationResult {
  auth?: Record<string, unknown>;
  features?: Record<string, unknown>;
  localization?: {
    currentLanguage?: {
      name?: string;
      displayName?: string;
      icon?: string;
      isDefault?: boolean;
      isDisabled?: boolean;
      isRightToLeft?: boolean;
    };
    languages?: Array<{
      name?: string;
      displayName?: string;
      icon?: string;
      isDefault?: boolean;
      isDisabled?: boolean;
      isRightToLeft?: boolean;
    }>;
    sources?: Array<{
      name?: string;
      sourceName?: string;
      type?: string;
    }>;
    defaultSourceName?: string;
    values?: Record<string, Record<string, string>>;
  };
  nav?: Record<string, unknown>;
  setting?: {
    values?: Record<string, string>;
  };
  clock?: {
    provider?: string;
  };
  timing?: {
    timeZoneInfo?: {
      windows?: {
        timeZoneId?: string;
        baseUtcOffsetInMilliseconds?: number;
        currentUtcOffsetInMilliseconds?: number;
        isDaylightSavingTimeNow?: boolean;
      };
      iana?: {
        timeZoneId?: string;
      };
    };
  };
  multiTenancy?: Record<string, unknown>;
  session?: Record<string, unknown>;
  security?: Record<string, unknown>;
}

export async function fetchAbpUserConfiguration(
  baseUrl?: string,
): Promise<AbpUserConfigurationResult | null> {
  const root = (baseUrl || AppConsts.remoteServiceBaseUrl || "").replace(
    /\/$/,
    "",
  );
  const url = root + "/AbpUserConfiguration/GetAll";
  const response = await apiHttp().get(url, {
    headers: { Accept: "application/json" },
  });
  return response.data;
}
