import { forwardRef, useImperativeHandle, useState, useRef } from "react";
import { Modal, DatePicker } from "antd";
import {
  CommonLookupServiceProxy,
  CreateUserDelegationDto,
  FindUsersInput,
  FindUsersOutputDto,
  UserDelegationServiceProxy,
  type PagedResultDtoOfFindUsersOutputDto,
} from "../../../../../api/generated/service-proxies";
import CommonLookupModal, {
  type CommonLookupModalOptions,
} from "../../../components/common/lookup";
import {
  getEndOfDayForDate,
  getStartOfDayForDate,
} from "../../../components/common/timing/lib/datetime-helper";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { Dayjs } from "dayjs";
import AppConsts from "@/lib/app-consts";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

export type CreateNewUserDelegationModalHandle = { show: () => void };

type Props = {
  onSaved?: () => void;
};

const CreateNewUserDelegationModal = forwardRef<
  CreateNewUserDelegationModalHandle,
  Props
>(({ onSaved }, ref) => {
  const userDelegationService = useServiceProxy(UserDelegationServiceProxy, []);
  const commonLookupService = useServiceProxy(CommonLookupServiceProxy, []);
  const delayedFocus = useDelayedFocus();

  const [visible, setVisible] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);

  const [isLookupOpen, setLookupOpen] = useState<boolean>(false);
  const pickButtonRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => ({
    show: () => {
      setSelectedUserId(null);
      setSelectedUsername("");
      setStartTime(null);
      setEndTime(null);
      setVisible(true);
    },
  }));

  const close = () => setVisible(false);

  const lookupOptions: CommonLookupModalOptions<FindUsersOutputDto> = {
    title: L("SelectAUser"),
    columns: [
      {
        key: "fullName",
        title: L("Name"),
        render: (u) =>
          [u.name, u.surname].filter(Boolean).join(" ") ||
          u.emailAddress ||
          "-",
      },
      { key: "email", title: L("EmailAddress"), dataIndex: "emailAddress" },
    ],
    dataSource: async (
      skipCount,
      maxResultCount,
      filter,
      tenantId,
      excludeCurrentUser = true,
    ) => {
      const input = new FindUsersInput();
      input.filter = filter;
      input.excludeCurrentUser = excludeCurrentUser;
      input.maxResultCount = maxResultCount;
      input.skipCount = skipCount;
      input.tenantId = tenantId;
      const res: PagedResultDtoOfFindUsersOutputDto =
        await commonLookupService.findUsers(input);
      return { totalCount: res.totalCount, items: res.items || [] };
    },
  };

  const onUserPicked = (user: FindUsersOutputDto) => {
    setSelectedUserId(user.id);
    const displayName =
      [user.name, user.surname].filter(Boolean).join(" ") ||
      user.emailAddress ||
      "";
    setSelectedUsername(displayName);
  };

  const setUserIdNull = () => {
    setSelectedUserId(null);
    setSelectedUsername("");
  };

  const canSave =
    !!selectedUserId &&
    !!startTime &&
    !!endTime &&
    startTime.valueOf() <= endTime.valueOf();

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const input = new CreateUserDelegationDto();
      input.targetUserId = selectedUserId as number;
      input.startTime = getStartOfDayForDate(startTime);
      input.endTime = getEndOfDayForDate(endTime);
      await userDelegationService.delegateNewUser(input);
      abp?.notify?.info?.(L("SavedSuccessfully"));
      setVisible(false);
      if (onSaved) onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        title={L("DelegateNewUser")}
        open={visible}
        onCancel={close}
        mask={{ closable: false }}
        destroyOnHidden
        afterOpenChange={(opened) => {
          if (opened) {
            delayedFocus(pickButtonRef);
          }
        }}
        footer={
          <div className="d-flex justify-content-end gap-3">
            <button
              type="button"
              className="btn btn-light-primary fw-bold"
              onClick={close}
              disabled={saving}
            >
              {L("Cancel")}
            </button>
            <button
              type="button"
              className="btn btn-primary fw-bold"
              onClick={() => void save()}
              disabled={!canSave || saving}
            >
              <i className="fa fa-save" />
              <span className="ms-2">{L("Save")}</span>
            </button>
          </div>
        }
      >
        <div>
          <div className="mb-5">
            <label className="form-label">{L("Username")}</label>
            <div className="input-group">
              <input
                className="form-control"
                type="text"
                value={selectedUsername}
                readOnly
                disabled
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setLookupOpen(true)}
                ref={pickButtonRef}
              >
                <i className="fa fa-search" />
                <span className="ms-2">{L("Pick")}</span>
              </button>
              <button
                type="button"
                className="btn btn-danger btn-icon"
                onClick={setUserIdNull}
                aria-label={L("Clear")}
              >
                <i className="fa fa-times" />
              </button>
            </div>
          </div>

          <div className="mb-5">
            <label className="form-label" htmlFor="StartTime">
              {L("StartTime")}
            </label>

            <DatePicker
              id="StartTime"
              name="StartTime"
              className="form-control"
              showTime
              format={AppConsts.timing.longDateFormat}
              value={startTime}
              onChange={(value) => setStartTime(value)}
              maxDate={endTime ?? undefined}
              required
            />
          </div>

          <div className="mb-5">
            <label className="form-label" htmlFor="EndTime">
              {L("EndTime")}
            </label>
            <DatePicker
              id="EndTime"
              name="EndTime"
              className="form-control"
              showTime
              format={AppConsts.timing.longDateFormat}
              value={endTime}
              onChange={(value) => setEndTime(value)}
              minDate={startTime ?? undefined}
              required
            />
          </div>
        </div>
      </Modal>

      <CommonLookupModal<FindUsersOutputDto>
        isOpen={isLookupOpen}
        onClose={() => setLookupOpen(false)}
        options={lookupOptions}
        onItemSelected={onUserPicked}
      />
    </>
  );
});

export default CreateNewUserDelegationModal;
