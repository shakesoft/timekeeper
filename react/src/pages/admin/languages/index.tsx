import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { App } from "antd";
import { usePermissions } from "../../../hooks/usePermissions";
import CreateOrEditLanguageModal from "./components/CreateOrEditLanguageModal";
import {
  ApplicationLanguageListDto,
  LanguageServiceProxy,
  SetDefaultLanguageInput,
} from "@api/generated/service-proxies";
import PageHeader from "../components/common/PageHeader";
import { formatDate } from "../components/common/timing/lib/datetime-helper";
import { useSession } from "@hooks/useSession";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useTheme } from "@/hooks/useTheme";
import { Dayjs } from "dayjs";
import AppConsts from "@/lib/app-consts";

const LanguagesPage: React.FC = () => {
  const { isGranted, isGrantedAny } = usePermissions();
  const session = useSession();
  const navigate = useNavigate();
  const languageService = useServiceProxy(LanguageServiceProxy, []);
  const { modal } = App.useApp();
  const { containerClass } = useTheme();
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState<ApplicationLanguageListDto[]>([]);
  const [defaultLanguageName, setDefaultLanguageName] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLanguageId, setEditingLanguageId] = useState<
    number | undefined
  >();
  const [openActionsId, setOpenActionsId] = useState<number | null>(null);

  const fetchLanguages = useCallback(async () => {
    setLoading(true);
    try {
      const result = await languageService.getLanguages();
      setLanguages(result.items ?? []);
      setDefaultLanguageName(result.defaultLanguageName ?? "");
    } finally {
      setLoading(false);
    }
  }, [languageService]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  const deleteLanguage = (language: ApplicationLanguageListDto) => {
    modal.confirm({
      title: L("AreYouSure"),
      content: L("LanguageDeleteWarningMessage", language.displayName),
      onOk: async () => {
        await languageService.deleteLanguage(language.id!);
        fetchLanguages();
      },
    });
  };

  const setAsDefaultLanguage = async (language: ApplicationLanguageListDto) => {
    const input = new SetDefaultLanguageInput({ name: language.name ?? "" });
    await languageService.setDefaultLanguage(input);
    fetchLanguages();
  };

  const changeTexts = (language: ApplicationLanguageListDto) => {
    navigate(`/app/admin/languages/texts/${language.name}`);
  };

  const toggleActions = (id: number | undefined) => {
    if (!id) return;
    setOpenActionsId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      <PageHeader
        title={L("Languages")}
        description={L("LanguagesHeaderInfo")}
        actions={
          isGranted("Pages.Administration.Languages.Create") &&
          !session.tenant && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setEditingLanguageId(undefined);
                setIsModalVisible(true);
              }}
            >
              <i className="fa fa-plus btn-md-icon"></i>
              <span className="d-none d-md-inline-block">
                {L("CreateNewLanguage")}
              </span>
            </button>
          )
        }
      />
      <div className={containerClass}>
        <div className="card card-custom gutter-b">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-12 primeng-datatable-container">
                <div className="table-responsive">
                  <table
                    className="table align-middle table-row-dashed"
                    style={{ minWidth: "50rem" }}
                  >
                    <thead>
                      <tr>
                        {isGrantedAny(
                          "Pages.Administration.Languages.Edit",
                          "Pages.Administration.Languages.ChangeTexts",
                          "Pages.Administration.Languages.Delete",
                        ) && <th style={{ width: 130 }}>{L("Actions")}</th>}
                        <th>{L("Name")}</th>
                        <th>{L("Code")}</th>
                        {session.tenant ? <th>{L("Default")} *</th> : null}
                        <th>{L("IsEnabled")}</th>
                        <th>{L("CreationTime")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {languages.map((record) => (
                        <tr key={record.id}>
                          {isGrantedAny(
                            "Pages.Administration.Languages.Edit",
                            "Pages.Administration.Languages.ChangeTexts",
                            "Pages.Administration.Languages.Delete",
                          ) && (
                            <td style={{ width: 130, textAlign: "center" }}>
                              <div className="btn-group">
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm dropdown-toggle"
                                  onClick={() => toggleActions(record.id)}
                                  aria-controls={`dropdownMenu-${record.id}`}
                                >
                                  <i className="fa fa-cog"></i>
                                  <span className="caret ms-2"></span>{" "}
                                  {L("Actions")}
                                </button>
                                {openActionsId === record.id && (
                                  <ul
                                    id={`dropdownMenu-${record.id}`}
                                    className="dropdown-menu show"
                                    role="menu"
                                    data-bs-popper="static"
                                  >
                                    {isGranted(
                                      "Pages.Administration.Languages.Edit",
                                    ) &&
                                      record.tenantId == session.tenant?.id && (
                                        <li role="menuitem">
                                          <button
                                            type="button"
                                            className="dropdown-item"
                                            onClick={() => {
                                              setEditingLanguageId(record.id);
                                              setIsModalVisible(true);
                                              setOpenActionsId(null);
                                            }}
                                          >
                                            {L("Edit")}
                                          </button>
                                        </li>
                                      )}
                                    {isGranted(
                                      "Pages.Administration.Languages.ChangeTexts",
                                    ) && (
                                      <li role="menuitem">
                                        <button
                                          type="button"
                                          className="dropdown-item"
                                          onClick={() => {
                                            changeTexts(record);
                                            setOpenActionsId(null);
                                          }}
                                        >
                                          {L("ChangeTexts")}
                                        </button>
                                      </li>
                                    )}
                                    {isGranted(
                                      "Pages.Administration.Languages.ChangeDefaultLanguage",
                                    ) && (
                                      <li role="menuitem">
                                        <button
                                          type="button"
                                          className="dropdown-item"
                                          onClick={() => {
                                            setAsDefaultLanguage(record);
                                            setOpenActionsId(null);
                                          }}
                                        >
                                          {L("SetAsDefaultLanguage")}
                                        </button>
                                      </li>
                                    )}
                                    {isGranted(
                                      "Pages.Administration.Languages.Delete",
                                    ) &&
                                      record.tenantId == session.tenant?.id && (
                                        <li role="menuitem">
                                          <button
                                            type="button"
                                            className="dropdown-item"
                                            onClick={() => {
                                              deleteLanguage(record);
                                              setOpenActionsId(null);
                                            }}
                                          >
                                            {L("Delete")}
                                          </button>
                                        </li>
                                      )}
                                  </ul>
                                )}
                              </div>
                            </td>
                          )}
                          <td>
                            <span
                              className={
                                record.name === defaultLanguageName
                                  ? "text-bold"
                                  : undefined
                              }
                            >
                              <i
                                className={`${record.icon} d-inline-block me-2`}
                              ></i>
                              {record.displayName}
                              {record.name === defaultLanguageName && (
                                <span className="ms-2">({L("Default")})</span>
                              )}
                            </span>
                          </td>
                          <td>{record.name}</td>
                          {session.tenant ? (
                            <td>
                              {record.name === defaultLanguageName ? (
                                <span className="badge badge-success">
                                  {L("Yes")}
                                </span>
                              ) : (
                                <span className="badge badge-dark">
                                  {L("No")}
                                </span>
                              )}
                            </td>
                          ) : null}
                          <td>
                            {!record.isDisabled ? (
                              <span className="badge badge-success">
                                {L("Yes")}
                              </span>
                            ) : (
                              <span className="badge badge-dark">
                                {L("No")}
                              </span>
                            )}
                          </td>
                          <td>
                            {formatDate(
                              record.creationTime as unknown as Dayjs | string,
                              AppConsts.timing.longDateFormat,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!loading && languages.length === 0 && (
                  <div className="primeng-no-data">{L("NoData")}</div>
                )}
                <div className="ui-table-footer">
                  {L("TotalRecordsCount", languages.length)}
                </div>
              </div>
            </div>
            {session.tenant ? (
              <p className="col-12 mt-2">
                * {L("CanNotEditOrDeleteDefaultLanguages")}
              </p>
            ) : null}
          </div>
        </div>
        <CreateOrEditLanguageModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSave={fetchLanguages}
          languageId={editingLanguageId}
        />
      </div>
    </>
  );
};
export default LanguagesPage;
