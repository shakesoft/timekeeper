import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CreateOrUpdateUserInput,
  GetUserForEditOutput,
  OrganizationUnitDto,
  ProfileServiceProxy,
  OrganizationUnitServiceProxy,
  UserEditDto,
  UserRoleDto,
  UserServiceProxy,
} from "@api/generated/service-proxies";
import OrganizationUnitTree from "../../components/common/trees/OrganizationUnitTree";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { usePermissions } from "@/hooks/usePermissions";
import ChangeProfilePictureModal, {
  ChangeProfilePictureModalHandle,
} from "../../components/layout/profile/ChangeProfilePictureModal";
import { Modal, Tabs } from "antd";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId?: number;
}

const defaultProfile = "/assets/common/images/default-profile-picture.png";

const CreateOrEditUserModal: React.FC<Props> = ({
  visible,
  onClose,
  onSaved,
  userId,
}) => {
  const userService = useServiceProxy(UserServiceProxy, []);
  const profileService = useServiceProxy(ProfileServiceProxy, []);
  const organizationUnitService = useServiceProxy(
    OrganizationUnitServiceProxy,
    [],
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<GetUserForEditOutput | null>(null);
  const [roles, setRoles] = useState<UserRoleDto[]>([]);
  const [assignedRoleNames, setAssignedRoleNames] = useState<string[]>([]);
  const [sendActivationEmail, setSendActivationEmail] = useState<boolean>(true);
  const [setRandomPassword, setSetRandomPassword] = useState<boolean>(true);
  const [profilePicture, setProfilePicture] = useState<string>(defaultProfile);
  const [allOrganizationUnits, setAllOrganizationUnits] = useState<
    OrganizationUnitDto[]
  >([]);
  const [selectedOrganizationUnitIds, setSelectedOrganizationUnitIds] =
    useState<number[]>([]);
  const [isSMTPSettingsProvided, setIsSMTPSettingsProvided] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("info");
  const [userValues, setUserValues] = useState<Partial<UserEditDto>>({});
  const [passwordRepeat, setPasswordRepeat] = useState<string>("");
  const { isGranted } = usePermissions();
  const changeProfilePictureModalRef =
    useRef<ChangeProfilePictureModalHandle>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const delayedFocus = useDelayedFocus();

  useEffect(() => {
    if (!visible) {
      setActiveTab("info");
      return;
    }
    setLoading(true);
    userService
      .getUserForEdit(userId)
      .then((res) => {
        setData(res);
        setRoles(res.roles ?? []);
        setSendActivationEmail(res.isSMTPSettingsProvided);
        setAssignedRoleNames(
          (res.roles ?? [])
            .filter((r) => r.isAssigned && !r.inheritedFromOrganizationUnit)
            .map((r) => r.roleName!),
        );
        setSelectedOrganizationUnitIds(
          (res.memberedOrganizationUnits ?? []).map((id) => Number(id)),
        );
        const u = res.user;
        setUserValues({
          ...u,
          password: undefined,
        });
        setIsSMTPSettingsProvided(!!res.isSMTPSettingsProvided);
        setPasswordRepeat("");
        if (userId) {
          setSetRandomPassword(false);
        } else {
          setSetRandomPassword(true);
        }
        return userId ? profileService.getProfilePictureByUser(userId) : null;
      })
      .then((pic) => {
        if (pic && pic.profilePicture) {
          setProfilePicture(`data:image/jpeg;base64,${pic.profilePicture}`);
        } else {
          setProfilePicture(defaultProfile);
        }
      })
      .finally(() => setLoading(false));
    if (visible) {
      organizationUnitService
        .getOrganizationUnits()
        .then((result) => setAllOrganizationUnits(result.items ?? []));
    }
  }, [visible, userId, userService, profileService, organizationUnitService]);

  useEffect(() => {
    if (!visible || !userId) return;

    const refreshProfilePicture = () => {
      profileService
        .getProfilePictureByUser(userId)
        .then((pic) => {
          if (pic && pic.profilePicture) {
            setProfilePicture(`data:image/jpeg;base64,${pic.profilePicture}`);
          } else {
            setProfilePicture(defaultProfile);
          }
        })
        .catch(() => void 0);
    };

    abp?.event?.on?.("profilePictureChanged", refreshProfilePicture);

    return () => {
      abp?.event?.off?.("profilePictureChanged", refreshProfilePicture);
    };
  }, [visible, userId, profileService]);

  const isEmailValid = (value?: string) => {
    if (!value) return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    return /.+@.+\..+/.test(trimmed);
  };

  const isFormValid = useMemo(() => {
    const nameValid = !!userValues.name && userValues.name.trim().length > 0;
    const surnameValid =
      !!userValues.surname && userValues.surname.trim().length > 0;
    const emailValid = isEmailValid(userValues.emailAddress);
    const userNameValid =
      !!userValues.userName && userValues.userName.trim().length > 0;

    const passwordValid = setRandomPassword
      ? true
      : userId
        ? !userValues.password ||
          (userValues.password.length <= 32 && userValues.password.length > 0)
        : !!userValues.password &&
          userValues.password.length <= 32 &&
          userValues.password.length > 0;

    const passwordRepeatValid = setRandomPassword
      ? true
      : passwordRepeat === (userValues.password || "");

    return (
      nameValid &&
      surnameValid &&
      emailValid &&
      userNameValid &&
      passwordValid &&
      passwordRepeatValid
    );
  }, [userValues, passwordRepeat, setRandomPassword, userId]);

  const handleSave = async () => {
    if (!isFormValid) return;
    const input = new CreateOrUpdateUserInput();
    input.user = new UserEditDto({ ...(userValues as UserEditDto) });
    input.setRandomPassword = setRandomPassword;
    input.sendActivationEmail = sendActivationEmail;
    input.assignedRoleNames = assignedRoleNames;
    input.organizationUnits = selectedOrganizationUnitIds;
    setSaving(true);
    try {
      await userService.createOrUpdateUser(input);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const isTwoFactorSettingEnabled = abp?.setting?.getBoolean?.(
    "Abp.Zero.UserManagement.TwoFactorLogin.IsEnabled",
  );
  const isLockoutSettingEnabled = abp?.setting?.getBoolean?.(
    "Abp.Zero.UserManagement.UserLockOut.IsEnabled",
  );
  const assignedRoleCount = assignedRoleNames.length;
  const assignedOuCount = selectedOrganizationUnitIds.length;

  const onCheckboxToggle = (roleName: string, disabled: boolean) => {
    if (disabled) return;
    setAssignedRoleNames((prev) => {
      const exists = prev.includes(roleName);
      if (exists) return prev.filter((n) => n !== roleName);
      return [...prev, roleName];
    });
  };

  const canChangeProfilePicture =
    !!userId && isGranted("Pages.Administration.Users.ChangeProfilePicture");

  return (
    <>
      <Modal
        title={
          userId ? (
            <span>
              {L("EditUser")}: {data?.user?.userName}
            </span>
          ) : (
            <span>{L("CreateNewUser")}</span>
          )
        }
        open={visible}
        onCancel={onClose}
        afterOpenChange={(open) => {
          if (open) {
            delayedFocus(firstInputRef);
          }
        }}
        width={900}
        footer={[
          <button
            key="cancel"
            type="button"
            className="btn btn-light-primary fw-bold"
            disabled={saving}
            onClick={onClose}
          >
            {L("Cancel")}
          </button>,
          <button
            key="save"
            type="button"
            className="btn btn-primary fw-bold ms-3"
            disabled={!isFormValid || saving || loading}
            onClick={handleSave}
          >
            <i className="fa fa-save" />
            <span className="ms-2">{L("Save")}</span>
          </button>,
        ]}
      >
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <input type="submit" style={{ display: "none" }} />
          <div className="modal-body">
            <div className="row">
              <div className="col-12">
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={[
                    {
                      key: "info",
                      label: L("UserInformations"),
                      children: (
                        <div className="tab-pane fade show active">
                          <div className="row">
                            <div className="col-sm-3 text-center mb-5 mt-5">
                              <img
                                src={profilePicture}
                                width={128}
                                height={128}
                                className="img-thumbnail img-rounded"
                                alt="profile"
                              />
                              {canChangeProfilePicture && (
                                <div className="mb-5 mt-5">
                                  <button
                                    type="button"
                                    className="btn btn-light btn-sm"
                                    onClick={() =>
                                      changeProfilePictureModalRef.current?.show(
                                        userId,
                                      )
                                    }
                                  >
                                    {L("ChangeProfilePicture")}
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="col-sm-9">
                              <div className="row">
                                <div className="col-12">
                                  <div className="mb-5">
                                    <label
                                      className="form-label required"
                                      htmlFor="Name"
                                    >
                                      {L("FirstName")}
                                    </label>
                                    <input
                                      ref={firstInputRef}
                                      id="Name"
                                      className="form-control"
                                      type="text"
                                      value={userValues.name || ""}
                                      maxLength={64}
                                      onChange={(e) =>
                                        setUserValues((p) => ({
                                          ...p,
                                          name: e.target.value,
                                        }))
                                      }
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="mb-5">
                                    <label
                                      className="form-label required"
                                      htmlFor="Surname"
                                    >
                                      {L("Surname")}
                                    </label>
                                    <input
                                      id="Surname"
                                      className="form-control"
                                      type="text"
                                      value={userValues.surname || ""}
                                      maxLength={64}
                                      onChange={(e) =>
                                        setUserValues((p) => ({
                                          ...p,
                                          surname: e.target.value,
                                        }))
                                      }
                                      required
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-5">
                            <label
                              className="form-label required"
                              htmlFor="EmailAddress"
                            >
                              {L("EmailAddress")}
                            </label>
                            <input
                              id="EmailAddress"
                              className="form-control"
                              type="email"
                              value={userValues.emailAddress || ""}
                              maxLength={256}
                              onChange={(e) =>
                                setUserValues((p) => ({
                                  ...p,
                                  emailAddress: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>

                          <div className="mb-5">
                            <label className="form-label" htmlFor="PhoneNumber">
                              {L("PhoneNumber")}
                            </label>
                            <input
                              id="PhoneNumber"
                              className="form-control"
                              type="text"
                              value={userValues.phoneNumber || ""}
                              maxLength={32}
                              onChange={(e) =>
                                setUserValues((p) => ({
                                  ...p,
                                  phoneNumber: e.target.value,
                                }))
                              }
                            />
                          </div>

                          <div className="mb-5">
                            <label
                              className="form-label required"
                              htmlFor="UserName"
                            >
                              {L("UserName")}
                            </label>
                            <div className="input-group">
                              <input
                                id="UserName"
                                className="form-control"
                                type="text"
                                value={userValues.userName || ""}
                                maxLength={256}
                                disabled={
                                  !!userId &&
                                  data?.user?.userName?.toLowerCase() ===
                                    "admin"
                                }
                                onChange={(e) =>
                                  setUserValues((p) => ({
                                    ...p,
                                    userName: e.target.value,
                                  }))
                                }
                                required
                              />
                              <span className="input-group-text">
                                <i
                                  className="fas fa-info-circle"
                                  title={L(
                                    "AllowedUserNameCharactersInfoText",
                                    [data?.allowedUserNameCharacters],
                                  )}
                                />
                              </span>
                            </div>
                            {!!userId &&
                              data?.user?.userName?.toLowerCase() ===
                                "admin" && (
                                <span className="form-text text-muted">
                                  {L("CanNotChangeAdminUserName")}
                                </span>
                              )}
                          </div>

                          <label className="form-check form-check-custom form-check-solid py-1">
                            <input
                              id="EditUser_SetRandomPassword"
                              type="checkbox"
                              className="form-check-input"
                              checked={setRandomPassword}
                              onChange={(e) =>
                                setSetRandomPassword(e.target.checked)
                              }
                            />
                            <span className="form-check-label">
                              {L("SetRandomPassword")}
                            </span>
                          </label>

                          {!setRandomPassword && (
                            <div className="row">
                              <div className="col-md-6">
                                <div className="mb-5">
                                  <label
                                    className="form-label"
                                    htmlFor="Password"
                                  >
                                    {L("Password")}
                                  </label>
                                  <input
                                    id="Password"
                                    type="password"
                                    className="form-control"
                                    value={userValues.password || ""}
                                    maxLength={32}
                                    onChange={(e) =>
                                      setUserValues((p) => ({
                                        ...p,
                                        password: e.target.value,
                                      }))
                                    }
                                    autoComplete="new-password"
                                    required={!userId && !setRandomPassword}
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="mb-5">
                                  <label
                                    className="form-label"
                                    htmlFor="PasswordRepeat"
                                  >
                                    {L("PasswordRepeat")}
                                  </label>
                                  <input
                                    id="PasswordRepeat"
                                    type="password"
                                    className="form-control"
                                    value={passwordRepeat}
                                    maxLength={32}
                                    onChange={(e) =>
                                      setPasswordRepeat(e.target.value)
                                    }
                                    autoComplete="new-password"
                                    required={!userId && !setRandomPassword}
                                  />
                                  {!setRandomPassword &&
                                    passwordRepeat &&
                                    passwordRepeat !==
                                      (userValues.password || "") && (
                                      <div className="form-text text-danger">
                                        {L("PasswordsDontMatch")}
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          )}

                          <label className="form-check form-check-custom form-check-solid py-1">
                            <input
                              id="EditUser_ShouldChangePasswordOnNextLogin"
                              type="checkbox"
                              className="form-check-input"
                              checked={
                                !!userValues.shouldChangePasswordOnNextLogin
                              }
                              onChange={(e) =>
                                setUserValues((p) => ({
                                  ...p,
                                  shouldChangePasswordOnNextLogin:
                                    e.target.checked,
                                }))
                              }
                            />
                            <span className="form-check-label">
                              {L("ShouldChangePasswordOnNextLogin")}
                            </span>
                          </label>

                          {!isSMTPSettingsProvided && (
                            <span className="form-text text-muted">
                              {L("SMTPSettingsNotProvidedWarningText")}
                            </span>
                          )}

                          <label
                            className={`form-check form-check-custom form-check-solid py-1 ${
                              !isSMTPSettingsProvided ? "checkbox-disabled" : ""
                            }`}
                          >
                            <input
                              id="EditUser_SendActivationEmail"
                              type="checkbox"
                              className="form-check-input"
                              checked={sendActivationEmail}
                              disabled={!isSMTPSettingsProvided}
                              onChange={(e) =>
                                setSendActivationEmail(e.target.checked)
                              }
                            />
                            <span className="form-check-label">
                              {L("SendActivationEmail")}
                            </span>
                          </label>

                          <label className="form-check form-check-custom form-check-solid py-1">
                            <input
                              id="EditUser_IsActive"
                              type="checkbox"
                              className="form-check-input"
                              checked={!!userValues.isActive}
                              onChange={(e) =>
                                setUserValues((p) => ({
                                  ...p,
                                  isActive: e.target.checked,
                                }))
                              }
                            />
                            <span className="form-check-label">
                              {L("Active")}
                            </span>
                          </label>

                          {isTwoFactorSettingEnabled && (
                            <label className="form-check form-check-custom form-check-solid py-1">
                              <input
                                id="EditUser_IsTwoFactorEnabled"
                                type="checkbox"
                                className="form-check-input"
                                checked={!!userValues.isTwoFactorEnabled}
                                onChange={(e) =>
                                  setUserValues((p) => ({
                                    ...p,
                                    isTwoFactorEnabled: e.target.checked,
                                  }))
                                }
                              />
                              <span className="form-check-label">
                                {L("IsTwoFactorEnabled")}
                              </span>
                            </label>
                          )}

                          {isLockoutSettingEnabled && (
                            <label className="form-check form-check-custom form-check-solid py-1">
                              <input
                                id="EditUser_IsLockoutEnabled"
                                type="checkbox"
                                className="form-check-input"
                                checked={!!userValues.isLockoutEnabled}
                                onChange={(e) =>
                                  setUserValues((p) => ({
                                    ...p,
                                    isLockoutEnabled: e.target.checked,
                                  }))
                                }
                              />
                              <span className="form-check-label">
                                {L("IsLockoutEnabled")}
                              </span>
                              <i
                                className="fas fa-info-circle ms-2"
                                title={L("IsLockoutEnabled_Hint")}
                              />
                            </label>
                          )}
                        </div>
                      ),
                    },
                    {
                      key: "roles",
                      label: (
                        <>
                          {L("Roles")}{" "}
                          <span className="badge badge-success assigned-role-count ms-2">
                            {assignedRoleCount}
                          </span>
                        </>
                      ),
                      children: (
                        <div className="tab-pane fade show active">
                          <div className="row">
                            {roles.map((role) => {
                              const disabled =
                                !!role.inheritedFromOrganizationUnit;
                              const checked = disabled
                                ? !!role.isAssigned
                                : assignedRoleNames.includes(
                                    role.roleName || "",
                                  );
                              return (
                                <div key={role.roleName} className="col-4">
                                  <label className="form-check form-check-custom form-check-solid py-1">
                                    <input
                                      id={`EditUser_${role.roleName}`}
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={checked}
                                      disabled={disabled}
                                      onChange={() =>
                                        onCheckboxToggle(
                                          role.roleName || "",
                                          disabled,
                                        )
                                      }
                                    />
                                    <span className="form-check-label">
                                      {role.roleDisplayName}
                                      {disabled && (
                                        <small className="ms-1">
                                          (
                                          {L(
                                            "RoleIsInheritedFromOrganizationUnit",
                                          )}
                                          )
                                        </small>
                                      )}
                                    </span>
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: "organizationUnits",
                      label: (
                        <>
                          {L("OrganizationUnits")}{" "}
                          <span className="badge badge-success assigned-role-count ms-2">
                            {assignedOuCount}
                          </span>
                        </>
                      ),
                      children: (
                        <div className="tab-pane fade show active">
                          <OrganizationUnitTree
                            allOrganizationUnits={allOrganizationUnits}
                            selectedOrganizationUnitIds={
                              selectedOrganizationUnitIds
                            }
                            onChange={setSelectedOrganizationUnitIds}
                          />
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>
      <ChangeProfilePictureModal ref={changeProfilePictureModalRef} />
    </>
  );
};

export default CreateOrEditUserModal;
