import type { ExternalAuthenticateResultModel } from "@/api/generated/service-proxies";

export interface ExternalLoginCallbacks {
  onExternalAuthSuccess: (result: ExternalAuthenticateResultModel) => void;
  onWaitingForActivation: () => void;
  onError: (error: unknown) => void;
}
