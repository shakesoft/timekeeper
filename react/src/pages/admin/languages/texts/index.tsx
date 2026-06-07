import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useDataTable } from "../../../../hooks/useDataTable";
import EditTextModal from "./components/EditTextModal";
import {
  ApplicationLanguageListDto,
  LanguageServiceProxy,
  LanguageTextListDto,
} from "@api/generated/service-proxies";
import PageHeader from "../../components/common/PageHeader";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import type { ColumnsType } from "antd/es/table";
import { Table } from "antd";
import { useTheme } from "@/hooks/useTheme";

const LanguageTextsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();
  const languageNameParam = params.languageName;
  const languageName =
    searchParams.get("languageName") || languageNameParam || "en";
  const languageService = useServiceProxy(LanguageServiceProxy, []);

  const { containerClass } = useTheme();
  const [languages, setLanguages] = useState<ApplicationLanguageListDto[]>([]);
  const [sourceNames, setSourceNames] = useState<string[]>([]);
  const [modalData, setModalData] = useState<LanguageTextListDto | null>(null);

  const filters = useMemo(
    () => ({
      sourceName: searchParams.get("sourceName") || "CadentManagement",
      baseLanguageName: searchParams.get("baseLanguageName") || "en",
      targetValueFilter: searchParams.get("targetValueFilter") || "ALL",
      filterText: searchParams.get("filterText") || "",
    }),
    [searchParams],
  );

  useEffect(() => {
    languageService
      .getLanguages()
      .then((result) => setLanguages(result.items ?? []));

    setSourceNames(
      abp.localization.sources
        .filter((source) => source.type === "MultiTenantLocalizationSource")
        .map((source) => source.name),
    );
  }, [languageService]);

  const fetchFunction = useCallback(
    (skipCount: number, maxResultCount: number, sorting: string) =>
      languageService.getLanguageTexts(
        filters.sourceName,
        languageName!,
        maxResultCount,
        skipCount,
        sorting,
        filters.baseLanguageName,
        filters.targetValueFilter,
        filters.filterText,
      ),
    [languageName, filters, languageService],
  );

  const { records, loading, pagination, handleTableChange, fetchData } =
    useDataTable<LanguageTextListDto>(fetchFunction);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setSearchParams(
      (prev) => {
        if (value) {
          prev.set(key, value);
        } else {
          prev.delete(key);
        }
        return prev;
      },
      { replace: true },
    );
  };

  const handleRefresh = () => {
    const nextLanguageName = searchParams.get("languageName") || languageName;
    const querySearchParams = new URLSearchParams({
      sourceName: filters.sourceName,
      baseLanguageName: filters.baseLanguageName,
      targetValueFilter: filters.targetValueFilter,
      filterText: filters.filterText,
    }).toString();
    navigate(
      `/app/admin/languages/texts/${nextLanguageName}?${querySearchParams}`,
      { replace: true },
    );

    handleTableChange({ ...pagination, current: 1 }, {});
  };

  const truncateString = (text?: string, maxLen = 32) => {
    if (!text) return "";
    return text.length > maxLen ? `${text.substring(0, maxLen)}...` : text;
  };

  const columns: ColumnsType<LanguageTextListDto> = [
    {
      title: L("Key"),
      dataIndex: "key",
      sorter: true,
      render: (text?: string) => (
        <span title={text || ""}>{truncateString(text || "")}</span>
      ),
    },
    {
      title: L("BaseValue"),
      dataIndex: "baseValue",
      sorter: true,
      render: (text?: string) => (
        <span title={text || ""}>{truncateString(text || "")}</span>
      ),
    },
    {
      title: L("TargetValue"),
      dataIndex: "targetValue",
      sorter: true,
      render: (text?: string) => (
        <span title={text || ""}>{truncateString(text || "")}</span>
      ),
    },
    {
      title: L("Edit"),
      key: "actions",
      width: 100,
      render: (_, record) => (
        <button
          type="button"
          className="btn btn-sm btn-icon btn-light-primary"
          onClick={() => setModalData(record)}
          title={L("Edit")}
          aria-label={L("Edit")}
        >
          <i className="la la-edit" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={L("LanguageTexts")}
        description={L("LanguageTextsHeaderInfo")}
      />
      <div className={containerClass}>
        <div className="card card-custom gutter-b">
          <div className="card-body">
            <form
              autoComplete="new-password"
              className="form"
              id="TextsFilterForm"
            >
              <div>
                <div className="row align-items-center m--margin-bottom-10">
                  <div className="col-sm-6 col-md-3">
                    <div className="mb-5">
                      <label className="form-label">{L("BaseLanguage")}</label>
                      <select
                        name="baseLanguageName"
                        className="form-control bs-select"
                        value={filters.baseLanguageName}
                        onChange={(e) =>
                          handleFilterChange("baseLanguageName", e.target.value)
                        }
                      >
                        {languages.map((language) => (
                          <option
                            key={language.name}
                            value={language.name}
                            data-icon={language.icon || undefined}
                          >
                            {language.displayName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <div className="mb-5">
                      <label className="form-label">
                        {L("TargetLanguage")}
                      </label>
                      <select
                        name="targetLanguageName"
                        className="form-control bs-select"
                        value={languageName}
                        onChange={(e) =>
                          handleFilterChange("languageName", e.target.value)
                        }
                      >
                        {languages.map((language) => (
                          <option
                            key={language.name}
                            value={language.name}
                            data-icon={language.icon || undefined}
                          >
                            {language.displayName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <div className="mb-5">
                      <label className="form-label">{L("Source")}</label>
                      <select
                        name="sourceName"
                        className="form-control bs-select"
                        value={filters.sourceName}
                        onChange={(e) =>
                          handleFilterChange("sourceName", e.target.value)
                        }
                      >
                        {sourceNames.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-6 col-md-3">
                    <div className="mb-5">
                      <label className="form-label">{L("TargetValue")}</label>
                      <select
                        name="targetValueFilter"
                        className="form-control bs-select"
                        value={filters.targetValueFilter}
                        onChange={(e) =>
                          handleFilterChange(
                            "targetValueFilter",
                            e.target.value,
                          )
                        }
                      >
                        <option value="ALL">{L("All")}</option>
                        <option value="EMPTY">{L("EmptyOnes")}</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row align-items-center mb-4">
                  <div className="col-sm-12">
                    <div className="input-group">
                      <input
                        value={searchParams.get("filterText") || ""}
                        name="filterText"
                        className="form-control"
                        placeholder={L("SearchWithThreeDot")}
                        onChange={(e) =>
                          handleFilterChange("filterText", e.target.value)
                        }
                        type="text"
                      />
                      <button
                        onClick={handleRefresh}
                        className="btn btn-primary"
                        type="button"
                      >
                        <i className="la la-refresh" /> {L("Refresh")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="row align-items-center">
              <div className="col">
                <Table
                  size="middle"
                  rowKey={(r) => r.key as string}
                  columns={columns}
                  dataSource={records}
                  loading={loading}
                  pagination={pagination}
                  onChange={(pagination, _filters, sort) =>
                    handleTableChange(pagination, sort)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {modalData && (
        <EditTextModal
          isVisible={!!modalData}
          onClose={() => setModalData(null)}
          onSave={fetchData}
          initialData={{
            key: modalData.key || "",
            baseValue: modalData.baseValue || "",
            targetValue: modalData.targetValue || "",
            sourceName: filters.sourceName,
            baseLanguageName: filters.baseLanguageName,
            targetLanguageName: languageName,
          }}
        />
      )}
    </div>
  );
};
export default LanguageTextsPage;
