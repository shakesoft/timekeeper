import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../../../../hooks/useAuth";
import {
  SessionServiceProxy,
  UserLoginServiceProxy,
} from "@api/generated/service-proxies";
import { createServiceProxy } from "@/api/service-proxy-factory";
import { hardLogout } from "@/lib/auth-helpers";

type NullableNumber = number | null;

const LAST_ACTIVITY_KEY = "Abp.SessionTimeOut.UserLastActivityTime";
const DEFAULT_TIMEOUT_SECONDS = 15 * 60;
const DEFAULT_NOTIFY_SECONDS = 30;
const ACTIVITY_DEBOUNCE_MS = 350;

function getSettingString(settingName: string): string | undefined {
  if (abp?.setting?.get) {
    return abp.setting.get(settingName);
  }
  return undefined;
}

function getSettingInt(settingName: string, defaultValue: number): number {
  const raw = getSettingString(settingName);
  const parsed = raw !== undefined ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function writeLastActivity(timestampMs: number): void {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(timestampMs));
    return;
  }
  abp?.utils?.setCookieValue?.(LAST_ACTIVITY_KEY, String(timestampMs));
}

function readLastActivity(): NullableNumber {
  if (typeof localStorage !== "undefined") {
    const value = localStorage.getItem(LAST_ACTIVITY_KEY);
    return value ? parseInt(value, 10) : null;
  }
  const value = abp?.utils?.getCookieValue?.(LAST_ACTIVITY_KEY);
  return value ? parseInt(value, 10) : null;
}

export interface UseSessionTimeoutState {
  isEnabled: boolean;
  isOpen: boolean;
  secondsRemaining: number;
  progressPercent: number;
  close: () => void;
}

const DISABLED_STATE: UseSessionTimeoutState = {
  isEnabled: false,
  isOpen: false,
  secondsRemaining: 0,
  progressPercent: 100,
  close: () => {},
};

export function useSessionTimeout(): UseSessionTimeoutState {
  const { logout } = useAuth();

  const isEnabled = useMemo(
    () =>
      !!abp?.setting?.getBoolean?.(
        "App.UserManagement.SessionTimeOut.IsEnabled",
      ) && !!abp?.session?.userId,
    [],
  );

  const timeOutSeconds = useMemo(
    () =>
      getSettingInt(
        "App.UserManagement.SessionTimeOut.TimeOutSecond",
        DEFAULT_TIMEOUT_SECONDS,
      ),
    [],
  );
  const notifySeconds = useMemo(
    () =>
      getSettingInt(
        "App.UserManagement.SessionTimeOut.ShowTimeOutNotificationSecond",
        DEFAULT_NOTIFY_SECONDS,
      ),
    [],
  );
  const showLockScreen = useMemo(
    () =>
      !!abp?.setting?.getBoolean?.(
        "App.UserManagement.SessionTimeOut.ShowLockScreenWhenTimedOut",
      ),
    [],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] =
    useState<number>(notifySeconds);
  const [progressPercent, setProgressPercent] = useState<number>(100);

  const countdownIntervalRef = useRef<number | null>(null);
  const isOpenRef = useRef(false);
  const isUserActiveRef = useRef(true);
  const lastWriteRef = useRef(0);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    setSecondsRemaining(notifySeconds);
    setProgressPercent(100);
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, [notifySeconds]);

  const redirectToLockScreen = useCallback(async () => {
    const sessionService = createServiceProxy(SessionServiceProxy);
    const userLoginService = createServiceProxy(UserLoginServiceProxy);

    try {
      const info = await sessionService.getCurrentLoginInformations();

      if (!info?.user) {
        logout();
        return;
      }

      const userId = info.user.id;
      if (userId == null) {
        logout();
        return;
      }
      const providerName =
        await userLoginService.getExternalLoginProviderNameByUser(userId);

      abp.utils.setCookieValue(
        "userInfo",
        JSON.stringify({
          userName: info.user.userName,
          profilePictureId: info.user.profilePictureId,
          tenant: info.tenant ? info.tenant.tenancyName : "Host",
          externalLoginProviderName: providerName || null,
        }),
        undefined,
        abp.appPath,
      );

      const { pathname, search, hash } = window.location;
      const fullPath = `${pathname}${search}${hash}`;
      const returnUrl = encodeURIComponent(fullPath);

      hardLogout();

      const basePath = abp.appPath ? abp.appPath.replace(/\/+$/, "") : "";
      window.location.href = `${basePath}/account/session-locked?returnUrl=${returnUrl}`;
    } catch {
      logout();
    }
  }, [logout]);

  const done = useCallback(() => {
    close();
    if (showLockScreen) {
      redirectToLockScreen();
    } else {
      logout();
    }
  }, [close, logout, showLockScreen, redirectToLockScreen]);

  const doneRef = useRef(done);
  useEffect(() => {
    doneRef.current = done;
  }, [done]);

  const startCountdown = useCallback(() => {
    setSecondsRemaining(notifySeconds);
    setProgressPercent(100);

    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
    }
    countdownIntervalRef.current = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setProgressPercent(0);
          window.clearInterval(countdownIntervalRef.current!);
          countdownIntervalRef.current = null;
          setTimeout(() => doneRef.current(), 0);
          return 0;
        }
        setProgressPercent(
          Math.max(0, Math.min(100, (next / notifySeconds) * 100)),
        );
        return next;
      });
    }, 1000);
  }, [notifySeconds]);

  useEffect(() => {
    if (!isEnabled) return;

    const onActivity = () => {
      const now = Date.now();
      if (now - lastWriteRef.current < ACTIVITY_DEBOUNCE_MS) return;
      lastWriteRef.current = now;
      isUserActiveRef.current = true;
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "click",
      "scroll",
      "keydown",
      "touchstart",
    ];

    events.forEach((evt) =>
      window.addEventListener(evt, onActivity, { passive: true }),
    );

    writeLastActivity(Date.now());

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, onActivity));
    };
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) return;

    const intervalId = window.setInterval(() => {
      if (isUserActiveRef.current) {
        writeLastActivity(Date.now());
        isUserActiveRef.current = false;
      }

      const last = readLastActivity();
      if (!last) return;
      const inactiveMs = Date.now() - last;
      const thresholdMs = timeOutSeconds * 1000;

      if (inactiveMs <= thresholdMs) {
        if (isOpenRef.current) {
          close();
        }
      } else {
        if (!isOpenRef.current) {
          setIsOpen(true);
          startCountdown();
        }
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isEnabled, close, startCountdown, timeOutSeconds]);

  if (!isEnabled) {
    return DISABLED_STATE;
  }

  return {
    isEnabled,
    isOpen,
    secondsRemaining,
    progressPercent,
    close,
  };
}
