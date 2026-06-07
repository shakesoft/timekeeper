import { forwardRef, useImperativeHandle, useState, useRef } from "react";
import { Modal } from "antd";
import {
  UserLinkServiceProxy,
  LinkToUserInput,
} from "../../../../../api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useSession } from "@/hooks/useSession";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

export type LinkAccountModalHandle = { show: () => void };

type Props = {
  onSaved?: () => void;
};

const LinkAccountModal = forwardRef<LinkAccountModalHandle, Props>(
  ({ onSaved }, ref) => {
    const userLinkService = useServiceProxy(UserLinkServiceProxy, []);
    const { tenant } = useSession();

    const [visible, setVisible] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);
    const [tenancyName, setTenancyName] = useState<string>("");
    const [usernameOrEmailAddress, setUsernameOrEmailAddress] =
      useState<string>("");
    const [password, setPassword] = useState<string>("");
    const tenancyNameRef = useRef<HTMLInputElement>(null);
    const userNameRef = useRef<HTMLInputElement>(null);
    const delayedFocus = useDelayedFocus();

    useImperativeHandle(ref, () => ({
      show: () => {
        setTenancyName(tenant?.tenancyName || "");
        setUsernameOrEmailAddress("");
        setPassword("");
        setVisible(true);
      },
    }));

    const canSave = !!usernameOrEmailAddress && !!password;

    const close = () => setVisible(false);

    const save = async () => {
      if (!canSave) return;
      setSaving(true);
      try {
        const input = new LinkToUserInput();
        input.tenancyName = tenancyName || undefined;
        input.usernameOrEmailAddress = usernameOrEmailAddress;
        input.password = password;
        await userLinkService.linkToUser(input);
        abp?.notify?.info?.(L("SavedSuccessfully"));
        setVisible(false);
        if (onSaved) onSaved();
      } finally {
        setSaving(false);
      }
    };

    return (
      <Modal
        title={L("LinkNewAccount")}
        open={visible}
        onCancel={close}
        mask={{ closable: false }}
        destroyOnHidden
        afterOpenChange={(opened) => {
          if (opened) {
            if (abp?.multiTenancy?.isEnabled) {
              delayedFocus(tenancyNameRef);
            } else {
              delayedFocus(userNameRef);
            }
          }
        }}
        footer={[
          <button
            key="cancel"
            type="button"
            className="btn btn-light-primary fw-bold"
            onClick={close}
            disabled={saving}
          >
            {L("Cancel")}
          </button>,
          <button
            key="ok"
            type="button"
            className="btn btn-primary fw-bold ms-3"
            onClick={() => void save()}
            disabled={!canSave || saving}
          >
            {L("Save")}
          </button>,
        ]}
      >
        {abp?.multiTenancy?.isEnabled && (
          <div className="mb-5">
            <label className="form-label" htmlFor="TenancyName">
              {L("TenancyName")}
            </label>
            <input
              id="TenancyName"
              type="text"
              className="form-control"
              value={tenancyName}
              onChange={(e) => setTenancyName(e.target.value)}
              maxLength={64}
              autoComplete="off"
              ref={tenancyNameRef}
            />
          </div>
        )}
        <div className="mb-5">
          <label className="form-label required" htmlFor="UserName">
            {L("UserName")}
          </label>
          <input
            id="UserName"
            type="text"
            className="form-control"
            value={usernameOrEmailAddress}
            onChange={(e) => setUsernameOrEmailAddress(e.target.value)}
            maxLength={256}
            required
            autoComplete="off"
            ref={userNameRef}
          />
        </div>
        <div className="mb-5">
          <label className="form-label required" htmlFor="Password">
            {L("Password")}
          </label>
          <input
            id="Password"
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={128}
            required
            autoComplete="off"
          />
        </div>
      </Modal>
    );
  },
);

export default LinkAccountModal;
