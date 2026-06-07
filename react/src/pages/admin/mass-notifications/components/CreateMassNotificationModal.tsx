import React, { useState, useEffect, useRef } from "react";
import { Modal, Select } from "antd";
import {
  CreateMassNotificationInput,
  NotificationServiceProxy,
  NameValueDto,
} from "@api/generated/service-proxies";
import UserLookupModal from "./UserLookupModal";
import OrganizationUnitLookupModal from "./OrganizationUnitLookupModal";
import { useForm, Controller } from "react-hook-form";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
}

const CreateMassNotificationModal: React.FC<Props> = ({
  isVisible,
  onClose,
  onSave,
}) => {
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    register,
    formState: { errors, isValid },
  } = useForm<CreateMassNotificationInput>({ mode: "onChange" });
  const [saving, setSaving] = useState(false);
  const [notifiers, setNotifiers] = useState<string[]>([]);
  const [isUserModalVisible, setUserModalVisible] = useState(false);
  const [isOuModalVisible, setOuModalVisible] = useState(false);
  const [userNames, setUserNames] = useState("");
  const [ouNames, setOuNames] = useState("");
  const firstButtonRef = useRef<HTMLButtonElement | null>(null);
  const delayedFocus = useDelayedFocus();

  const notificationService = useServiceProxy(NotificationServiceProxy, []);

  React.useEffect(() => {
    register("organizationUnitIds", {
      validate: (value) =>
        (Array.isArray(value) && value.length > 0) || L("ThisFieldIsRequired"),
    });
  }, [register]);

  useEffect(() => {
    if (isVisible) {
      reset(new CreateMassNotificationInput());
      setUserNames("");
      setOuNames("");
      notificationService.getAllNotifiers().then((result) => {
        setNotifiers(result);
      });
    }
  }, [isVisible, reset, notificationService]);

  const onSubmit = async (values: CreateMassNotificationInput) => {
    setSaving(true);
    try {
      await notificationService.createMassNotification(values);
      onSave();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleUsersSelected = (users: NameValueDto[]) => {
    setValue(
      "userIds",
      users.map((u) => parseInt(u.value!)),
    );
    setUserNames(users.map((u) => u.name).join(", "));
  };

  const handleOusSelected = (ous: { id: number; displayName: string }[]) => {
    setValue(
      "organizationUnitIds",
      ous.map((ou) => ou.id),
      { shouldValidate: true },
    );
    setOuNames(ous.map((ou) => ou.displayName).join(", "));
  };

  return (
    <>
      <Modal
        title={L("CreateNewMassNotification")}
        open={isVisible}
        onCancel={onClose}
        afterOpenChange={(opened) => {
          if (opened) {
            delayedFocus(firstButtonRef);
          }
        }}
        footer={[
          <button
            key="cancel"
            type="button"
            className="btn btn-light-primary fw-bold"
            onClick={onClose}
            disabled={saving}
          >
            {L("Cancel")}
          </button>,
          <button
            key="save"
            type="button"
            className="btn btn-primary fw-bold d-inline-flex align-items-center"
            onClick={handleSubmit(onSubmit)}
            disabled={saving || !isValid}
          >
            {saving && (
              <span className="spinner-border spinner-border-sm me-2"></span>
            )}
            <i className="fa fa-save me-2 align-middle"></i>
            <span className="align-middle">{L("Save")}</span>
          </button>,
        ]}
        width={800}
      >
        <div className="form" aria-disabled={saving}>
          <div className="row mb-3">
            <div className="col-9">
              <label className="form-label" htmlFor="MassNotificationUsers">
                {L("User")}
              </label>
              <input
                id="MassNotificationUsers"
                type="text"
                className="form-control"
                value={userNames}
                readOnly
              />
            </div>
            <div className="col-3">
              <button
                type="button"
                className="btn btn-secondary w-100"
                onClick={() => setUserModalVisible(true)}
                style={{ marginTop: 30 }}
              >
                {L("Pick")}
              </button>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-9">
              <label
                className="form-label required"
                htmlFor="MassNotificationOrganizationUnit"
              >
                {L("OrganizationUnit")}
              </label>
              <input
                id="MassNotificationOrganizationUnit"
                type="text"
                className="form-control"
                value={ouNames}
                required
                readOnly
              />
            </div>
            <div className="col-3">
              <button
                type="button"
                className="btn btn-secondary w-100"
                onClick={() => setOuModalVisible(true)}
                style={{ marginTop: 30 }}
              >
                {L("Pick")}
              </button>
            </div>
          </div>
          {errors.organizationUnitIds && (
            <div className="invalid-feedback d-block mb-3">
              {errors.organizationUnitIds.message?.toString() ||
                L("ThisFieldIsRequired")}
            </div>
          )}

          <div className="mb-5">
            <label className="form-label required" htmlFor="MassSeverity">
              {L("Severity")}
            </label>
            <Controller
              name="severity"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  id="MassSeverity"
                  className={`form-select mb-1 ${
                    errors.severity ? "is-invalid" : ""
                  }`}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  options={[
                    { label: L("Info"), value: 0 },
                    { label: L("Success"), value: 1 },
                    { label: L("Warn"), value: 2 },
                    { label: L("Error"), value: 3 },
                    { label: L("Fatal"), value: 4 },
                  ]}
                />
              )}
            />
            {errors.severity && (
              <div className="invalid-feedback d-block">
                {L("ThisFieldIsRequired")}
              </div>
            )}
          </div>

          <div className="mb-5">
            <label
              className="form-label required"
              htmlFor="MassTargetNotifiers"
            >
              {L("TargetNotifiers")}
            </label>
            <Controller
              name="targetNotifiers"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  id="MassTargetNotifiers"
                  className={`form-select mb-1 ${
                    errors.targetNotifiers ? "is-invalid" : ""
                  }`}
                  mode="multiple"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  options={notifiers.map((n) => ({ label: L(n), value: n }))}
                />
              )}
            />
            {errors.targetNotifiers && (
              <div className="invalid-feedback d-block">
                {L("ThisFieldIsRequired")}
              </div>
            )}
          </div>

          <div className="mb-0">
            <label className="form-label required" htmlFor="MassMessage">
              {L("Message")}
            </label>
            <Controller
              name="message"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <textarea
                  id="MassMessage"
                  {...field}
                  rows={4}
                  className={`form-control ${
                    errors.message ? "is-invalid" : ""
                  }`}
                />
              )}
            />
            {errors.message && (
              <div className="invalid-feedback d-block">
                {L("ThisFieldIsRequired")}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <UserLookupModal
        isVisible={isUserModalVisible}
        onClose={() => setUserModalVisible(false)}
        onSave={handleUsersSelected}
      />
      <OrganizationUnitLookupModal
        isVisible={isOuModalVisible}
        onClose={() => setOuModalVisible(false)}
        onSave={handleOusSelected}
      />
    </>
  );
};
export default CreateMassNotificationModal;
