import dayjs, { type ConfigType, type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";
import localizedFormat from "dayjs/plugin/localizedFormat";
import type { i18n } from "i18next";
import AppConsts from "@/lib/app-consts";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);
dayjs.extend(localizedFormat);

type TFunction = i18n["t"];
type DayjsLike = Dayjs | ConfigType | null | undefined;

const getAbpCurrentIanaZone = (): string | null => {
  if (
    abp &&
    abp.clock?.provider?.supportsMultipleTimezone &&
    abp.timing?.timeZoneInfo?.iana?.timeZoneId
  ) {
    return abp.timing.timeZoneInfo.iana.timeZoneId as string;
  }
  return null;
};

const getCurrentTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

const getDefaultTimeZone = (): string => {
  return getAbpCurrentIanaZone() ?? getCurrentTimeZone();
};

const invalidDayjs = (): Dayjs => dayjs(NaN);

const toDayjs = (value: DayjsLike, zone?: string): Dayjs | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (dayjs.isDayjs(value)) {
    return zone ? value.tz(zone) : value;
  }

  const instance = zone
    ? dayjs.tz(value as ConfigType, zone)
    : dayjs(value as ConfigType);

  return instance.isValid() ? instance : null;
};

const toDayjsOrInvalid = (value: DayjsLike, zone?: string): Dayjs => {
  return toDayjs(value, zone) ?? invalidDayjs();
};

export const getLocalDate = (): Dayjs => {
  return dayjs();
};

export const getDate = (): Dayjs => {
  const zone = getDefaultTimeZone();
  return dayjs().tz(zone);
};

export const getStartOfDay = (): Dayjs => {
  return getDate().startOf("day");
};

export const getEndOfDay = (): Dayjs => {
  return getDate().endOf("day");
};

export const getStartOfDayForDate = (
  date: Dayjs | Date | string | number | null | undefined,
): Dayjs => {
  const instance = toDayjs(date, getDefaultTimeZone());
  return instance ? instance.startOf("day") : invalidDayjs();
};

export const getEndOfDayForDate = (
  date: Dayjs | Date | string | number | null | undefined,
): Dayjs => {
  const instance = toDayjs(date, getDefaultTimeZone());
  return instance ? instance.endOf("day") : invalidDayjs();
};

export const plusDays = (
  date: Dayjs | Date | string,
  dayCount: number,
): Dayjs => {
  return toDayjsOrInvalid(date, getDefaultTimeZone()).add(dayCount, "day");
};

export const minusDays = (
  date: Dayjs | Date | string,
  dayCount: number,
): Dayjs => {
  return toDayjsOrInvalid(date, getDefaultTimeZone()).subtract(dayCount, "day");
};

export const formatDate = (
  date: Dayjs | Date | string | number | null | undefined,
  format: string,
): string => {
  if (format == null) {
    format = AppConsts.timing.longDateFormat;
  }
  const instance = toDayjs(date, getDefaultTimeZone());
  return instance?.isValid() ? instance.format(format) : "";
};

export const createDateRangePickerRanges = (
  t: TFunction,
): Record<string, [Dayjs, Dayjs]> => {
  const todayStart = getStartOfDay();
  const todayEnd = getEndOfDay();

  const yesterdayStart = getStartOfDay().subtract(1, "day");
  const yesterdayEnd = getEndOfDay().subtract(1, "day");

  return {
    [t("Today")]: [todayStart, todayEnd],
    [t("Yesterday")]: [yesterdayStart, yesterdayEnd],
    [t("Last7Days")]: [getStartOfDay().subtract(6, "day"), todayEnd],
    [t("Last30Days")]: [getStartOfDay().subtract(29, "day"), todayEnd],
    [t("ThisMonth")]: [getDate().startOf("month"), getDate().endOf("month")],
    [t("LastMonth")]: [
      getDate().subtract(1, "month").startOf("month"),
      getDate().subtract(1, "month").endOf("month"),
    ],
  };
};

export const fromNow = (
  date: Dayjs | Date | string | number | null | undefined,
): string => {
  const instance = toDayjs(date);
  return instance?.isValid() ? instance.fromNow() : "";
};

export const getUTCDate = (): Dayjs => dayjs().utc();

export const getYear = (): number => getDate().year();

export const getStartOfWeek = (): Dayjs => getDate().startOf("week");

export const getStartOfDayMinusDays = (daysFromNow: number): Dayjs => {
  return getStartOfDay().subtract(daysFromNow, "day");
};

export const getEndOfDayPlusDays = (daysFromNow: number): Dayjs => {
  return getEndOfDay().add(daysFromNow, "day");
};

export const getEndOfDayMinusDays = (daysFromNow: number): Dayjs => {
  return getEndOfDay().subtract(daysFromNow, "day");
};

export const plusSeconds = (
  date: Dayjs | Date | string | number | null | undefined,
  seconds: number,
): Dayjs => {
  const instance = toDayjs(date);
  return instance ? instance.add(seconds, "second") : invalidDayjs();
};

export const fromISODateString = (date: string): Dayjs => {
  const zone = getDefaultTimeZone();
  return dayjs.tz(date, zone);
};

export const formatISODateString = (
  dateText: string,
  format: string,
): string => {
  const instance = fromISODateString(dateText);
  return instance.isValid() ? instance.format(format) : "";
};

export const formatJSDate = (jsDate: Date, format: string): string => {
  const instance = dayjs(jsDate);
  return instance.isValid() ? instance.format(format) : "";
};

export const getDiffInSeconds = (
  maxDate: Dayjs | Date | string | number,
  minDate: Dayjs | Date | string | number,
): number => {
  const max = toDayjsOrInvalid(maxDate);
  const min = toDayjsOrInvalid(minDate);
  return Math.round(max.diff(min, "second", true));
};

const pad = (value: number): string => value.toString().padStart(2, "0");

export const createDate = (year: number, month: number, day: number): Dayjs => {
  const zone = getDefaultTimeZone();
  const isoString = `${year}-${pad(month + 1)}-${pad(day)}`;
  return dayjs.tz(isoString, zone).startOf("day");
};

export const createJSDate = (
  year: number,
  month: number,
  day: number,
): Date => {
  return createDate(year, month, day).toDate();
};

export const createUtcDate = (
  year: number,
  month: number,
  day: number,
): Dayjs => {
  const isoString = `${year}-${pad(month + 1)}-${pad(day)}`;
  return dayjs.utc(isoString).startOf("day");
};

export const toUtcDate = (date: Dayjs | Date | string | number): Dayjs => {
  const instance = toDayjs(date);
  return instance ? instance.utc() : invalidDayjs();
};

export const toJSDate = (date: Dayjs): Date => date.toDate();

export const fromJSDate = (date: Date): Dayjs => dayjs(date);

export const getTimezoneOffset = (ianaTimezoneId: string): number => {
  return dayjs().tz(ianaTimezoneId).utcOffset();
};

export const changeTimeZone = (date: Date, ianaTimezoneId: string): Date => {
  return dayjs(date).tz(ianaTimezoneId).toDate();
};

export const changeDateTimeZone = (
  date: Dayjs,
  ianaTimezoneId: string,
): Dayjs => {
  return date.tz(ianaTimezoneId);
};
