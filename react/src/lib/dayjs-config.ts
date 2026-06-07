import dayjs from "dayjs";

function parseServerDate(value?: string): dayjs.Dayjs | undefined {
  if (!value) return undefined;
  // Strip to 3 fractional digits (if present)
  const clean = value.replace(/(\.\d{3})\d+/, "$1");
  return dayjs(clean);
}

export function initializeDayjs(): void {
  const originalFactory = dayjs;

  function safeDayjs(...args: unknown[]): dayjs.Dayjs {
    const arg = args[0];
    if (typeof arg === "string" && /\.\d{6,}/.test(arg)) {
      return parseServerDate(arg)!;
    }
    return (originalFactory as (...args: unknown[]) => dayjs.Dayjs)(...args);
  }

  // Re-export all properties so plugins and prototypes still work
  Object.assign(safeDayjs, originalFactory);

  if (typeof window !== "undefined") {
    (window as { dayjs?: unknown }).dayjs = safeDayjs;
  }
}
