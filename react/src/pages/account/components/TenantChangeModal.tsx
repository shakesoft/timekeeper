import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Modal } from "antd";
import {
  AccountServiceProxy,
  IsTenantAvailableInput,
  IsTenantAvailableOutput,
  TenantAvailabilityState,
} from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import { useSession } from "@/hooks/useSession";
import {
  getTenancyNameFromStorage,
  getTenantIdFromCookie,
} from "@/hooks/useTenantInfo";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";
import L from "@/lib/L";

type TenantChangeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TenantChangeModal: React.FC<TenantChangeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const accountService = useServiceProxy(AccountServiceProxy, []);
  const { tenant } = useSession();

  const [tenancyName, setTenancyName] = useState<string>("");
  const [isSwitchToTenant, setIsSwitchToTenant] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [touched, setTouched] = useState<boolean>(false);

  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const delayedFocus = useDelayedFocus();

  const submitButtonText = useMemo(() => {
    return isSwitchToTenant ? L("SwitchToTheTenant") : L("SwitchToTheHost");
  }, [isSwitchToTenant]);

  useEffect(() => {
    if (isOpen) {
      const storedTenancyName = getTenancyNameFromStorage();
      const currentTenancyName = (
        tenant?.tenancyName ||
        storedTenancyName ||
        ""
      ).trim();
      const hasTenantContext =
        !!tenant || !!currentTenancyName || !!getTenantIdFromCookie();
      setTenancyName(currentTenancyName);
      setIsSwitchToTenant(hasTenantContext);
      setTouched(false);
    }
  }, [tenant, isOpen]);

  const switchToTenant = useCallback((checked: boolean) => {
    setIsSwitchToTenant(checked);
  }, []);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  const save = useCallback(async () => {
    if (!isSwitchToTenant || !tenancyName) {
      abp?.multiTenancy?.setTenantIdCookie?.(undefined);
      abp?.utils?.deleteCookie?.("Abp.AuthToken", abp?.appPath);
      localStorage.removeItem("ABP_TENANCY_NAME");
      window.location.reload();
      return;
    }

    const input = new IsTenantAvailableInput();
    input.tenancyName = tenancyName;

    setSaving(true);
    try {
      const result: IsTenantAvailableOutput =
        await accountService.isTenantAvailable(input);
      switch (result.state) {
        case TenantAvailabilityState.Available:
          abp?.multiTenancy?.setTenantIdCookie?.(result.tenantId);
          localStorage.setItem("ABP_TENANCY_NAME", tenancyName);
          window.location.reload();
          return;
        case TenantAvailabilityState.InActive:
          abp?.message?.warn?.(L("TenantIsNotActive", tenancyName));
          delayedFocus(firstInputRef);
          break;
        case TenantAvailabilityState.NotFound:
        default:
          abp?.message?.warn?.(
            L("ThereIsNoTenantDefinedWithName{0}", tenancyName),
          );
          delayedFocus(firstInputRef);
          break;
      }
    } finally {
      setSaving(false);
    }
  }, [accountService, delayedFocus, isSwitchToTenant, tenancyName]);

  return (
    <Modal
      title={L("ChangeTenant")}
      open={isOpen}
      onCancel={close}
      mask={{ closable: false }}
      keyboard={!saving}
      centered
      afterOpenChange={(open) => {
        if (open && isSwitchToTenant) {
          delayedFocus(firstInputRef);
        }
      }}
      footer={[
        <button
          key="cancel"
          disabled={saving}
          type="button"
          className="btn btn-light-primary fw-bold"
          onClick={close}
        >
          {L("Cancel")}
        </button>,
        <button
          key="submit"
          type="button"
          className="btn btn-primary fw-bold save-button ms-3"
          disabled={saving || (isSwitchToTenant && !tenancyName)}
          onClick={() => {
            setTouched(true);
            if (isSwitchToTenant && !tenancyName) return;
            save();
          }}
        >
          {saving ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              <span>{L("ProcessingWithThreeDot")}</span>
            </>
          ) : (
            <>
              <i className="fa fa-arrow-circle-right"></i>
              <span className="ms-2">{submitButtonText}</span>
            </>
          )}
        </button>,
      ]}
    >
      <form
        className="form form-label-right"
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (isSwitchToTenant && !tenancyName) return;
          save();
        }}
      >
        <div className="row text-left mb-5">
          <label className="col-4 col-form-label">{L("SwitchToTenant")}</label>
          <div className="col">
            <label className="form-check form-check-custom form-check-solid form-switch py-1">
              <input
                type="checkbox"
                name="SwitchToTenant"
                className="form-check-input"
                checked={isSwitchToTenant}
                onChange={(e) => switchToTenant(e.target.checked)}
              />
            </label>
          </div>
        </div>

        <div className="row mb-0">
          <label className="col-4 col-form-label">{L("TenancyName")}</label>
          <label className="col">
            <input
              ref={firstInputRef}
              type="text"
              id="tenancyNameInput"
              name="tenancyNameInput"
              className="form-control"
              value={tenancyName}
              onChange={(e) => setTenancyName(e.target.value)}
              disabled={!isSwitchToTenant}
              placeholder={isSwitchToTenant ? L("EnterTenancyName") : ""}
              maxLength={64}
              onBlur={() => setTouched(true)}
            />
            {isSwitchToTenant && touched && !tenancyName ? (
              <span className="form-text text-danger text-left">
                {L("TenancyNameRequired")}
              </span>
            ) : null}
          </label>
        </div>
      </form>
    </Modal>
  );
};

export default TenantChangeModal;
