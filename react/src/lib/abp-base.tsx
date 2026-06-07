import { store } from "../app/store";
import { setAbpLocalization } from "../app/slices/localeSlice";
import type { AbpUserConfigurationResult } from "@/api/abp-user-configuration";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

function merge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  if (!source) return target;

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue)
      ) {
        target[key] = merge(
          (targetValue as Record<string, unknown>) || {},
          sourceValue as Record<string, unknown>,
        );
      } else {
        target[key] = sourceValue;
      }
    }
  }

  return target;
}

function getCurrentClockProvider(
  providerName?: string,
): abp.timing.IClockProvider {
  if (!providerName || !abp.timing) {
    return abp.timing.localClockProvider;
  }

  switch (providerName) {
    case "unspecifiedClockProvider":
      return abp.timing.unspecifiedClockProvider;
    case "utcClockProvider":
      return abp.timing.utcClockProvider;
    default:
      return abp.timing.localClockProvider;
  }
}

function configureDayjsLocale(): void {
  if (!abp.localization?.currentLanguage?.name) return;

  const locale = abp.localization.currentLanguage.name;

  if (locale !== "en") {
    import(/* @vite-ignore */ `dayjs/locale/${locale}`)
      .then(() => dayjs.locale(locale))
      .catch(() => dayjs.locale("en"));
  } else {
    dayjs.locale(locale);
  }
}

function configureDayjsTimezone(): void {
  if (!abp.clock?.provider?.supportsMultipleTimezone) return;

  const timeZoneId = abp.timing?.timeZoneInfo?.iana?.timeZoneId;
  if (timeZoneId) {
    dayjs.tz.setDefault(timeZoneId);
  }
}

function patchDayjsToJSON(): void {
  const proto = dayjs.prototype as {
    toJSON?: () => string;
    __abpToJsonPatched?: boolean;
  };

  if (proto.__abpToJsonPatched) return;

  proto.toJSON = function (this: dayjs.Dayjs) {
    if (!abp.clock?.provider?.supportsMultipleTimezone) {
      return this.locale("en").format();
    }

    const zoneId = abp.timing?.timeZoneInfo?.iana?.timeZoneId;
    const zoned = zoneId ? this.locale("en").tz(zoneId) : this.locale("en");
    return zoned.toISOString();
  };

  proto.__abpToJsonPatched = true;
}

function configureDayjs(): void {
  configureDayjsLocale();
  configureDayjsTimezone();
  patchDayjsToJSON();
}

export function applyAbpUserConfiguration(
  config: AbpUserConfigurationResult,
): void {
  if (!config || typeof window === "undefined" || !window.abp) return;

  merge(abp as Record<string, unknown>, config as Record<string, unknown>);

  if (config.clock?.provider) {
    abp.clock = abp.clock || ({} as typeof abp.clock);
    abp.clock.provider = getCurrentClockProvider(
      config.clock.provider as string,
    );
  }

  configureDayjs();

  if (!window.L) {
    window.L = function (key: string, ...args: unknown[]): string {
      if (!abp.localization?.localize) return key;
      const sourceName =
        (abp.localization?.defaultSourceName as string) || "CadentManagement";
      const allArgs = [key, sourceName, ...args];
      return (
        (abp.localization.localize as (...args: unknown[]) => string)(
          ...allArgs,
        ) || key
      );
    };
  }

  abp.event?.trigger?.("abp.dynamicScriptsInitialized");

  const lang = config.localization?.currentLanguage?.name || "en";
  store.dispatch(
    setAbpLocalization({
      selectedLang: lang,
      values: config.localization?.values as
        | Record<string, Record<string, string>>
        | undefined,
    }),
  );
}

if (typeof window !== "undefined") {
  window.__applyAbpUserConfiguration = applyAbpUserConfiguration;
}
