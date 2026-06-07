import { useMemo } from "react";
import { useSession } from "./useSession";
import AppConsts from "@/lib/app-consts";
import { SubscriptionPaymentType } from "@/api/generated/service-proxies";
import L from "@/lib/L";
import {
  fromISODateString,
  getUTCDate,
  plusDays,
} from "@/pages/admin/components/common/timing/lib/datetime-helper";

export const useSubscriptionNotification = () => {
  const { tenant } = useSession();

  const subscriptionIsExpiringSoon = useMemo((): boolean => {
    if (!tenant?.subscriptionEndDateUtc) {
      return false;
    }

    const subscriptionEndDate =
      typeof tenant.subscriptionEndDateUtc === "string"
        ? fromISODateString(tenant.subscriptionEndDateUtc)
        : tenant.subscriptionEndDateUtc;

    if (!subscriptionEndDate?.isValid) {
      return false;
    }

    const daysFromNow = plusDays(
      getUTCDate(),
      AppConsts.subscriptionExpireNootifyDayCount,
    );

    return daysFromNow >= subscriptionEndDate;
  }, [tenant]);

  const subscriptionStatusBarVisible = useMemo((): boolean => {
    const tenantId = tenant?.id ?? 0;

    return (
      tenantId > 0 &&
      tenant?.subscriptionPaymentType !==
        SubscriptionPaymentType.RecurringAutomatic &&
      (!!tenant?.isInTrialPeriod || subscriptionIsExpiringSoon)
    );
  }, [tenant, subscriptionIsExpiringSoon]);

  const getSubscriptionExpiringDayCount = useMemo((): number => {
    if (!tenant?.subscriptionEndDateUtc) {
      return 0;
    }

    const subscriptionEndDate =
      typeof tenant.subscriptionEndDateUtc === "string"
        ? fromISODateString(tenant.subscriptionEndDateUtc)
        : tenant.subscriptionEndDateUtc;

    if (!subscriptionEndDate?.isValid) {
      return 0;
    }

    const todayUTC = getUTCDate();
    const diff = subscriptionEndDate.diff(todayUTC, "days");
    return Math.round(diff);
  }, [tenant]);

  const getTrialSubscriptionNotification = (): string => {
    const editionDisplayName = tenant?.edition?.displayName || "";
    const clickHereLink = `<a href="/app/admin/subscription-management">${L(
      "ClickHere",
    )}</a>`;

    return L(
      "TrialSubscriptionNotification",
      `<strong>${editionDisplayName}</strong>`,
      clickHereLink,
    );
  };

  const getExpireNotification = (localizationKey: string): string => {
    return L(localizationKey, [getSubscriptionExpiringDayCount]);
  };

  return {
    subscriptionStatusBarVisible,
    subscriptionIsExpiringSoon,
    getSubscriptionExpiringDayCount,
    getTrialSubscriptionNotification,
    getExpireNotification,
  };
};
