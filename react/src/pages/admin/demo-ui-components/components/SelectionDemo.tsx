import React, { useState, useMemo, useCallback } from "react";
import { AutoComplete, Select, notification } from "antd";
import {
  DemoUiComponentsServiceProxy,
  NameValueOfString,
} from "../../../../api/generated/service-proxies";
import { debounce } from "lodash";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

const SelectionDemo: React.FC = () => {
  const demoUiComponentsService = useServiceProxy(
    DemoUiComponentsServiceProxy,
    [],
  );

  const [singleCountry, setSingleCountry] = useState<
    NameValueOfString | undefined
  >(undefined);
  const [multiCountries, setMultiCountries] = useState<NameValueOfString[]>([]);
  const [options, setOptions] = useState<
    { value: string; label: string; key: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const fetchCountries = useCallback(
    async (query: string) => {
      if (!query) {
        setOptions([]);
        return;
      }
      setLoading(true);
      try {
        const result = await demoUiComponentsService.getCountries(query);
        const formattedOptions = result.map((country: NameValueOfString) => ({
          key: country.value ?? "",
          value: country.name ?? "",
          label: country.name ?? "",
        }));
        setOptions(formattedOptions);
      } catch {
        abp.message.error(L("AnErrorOccurred"));
      } finally {
        setLoading(false);
      }
    },
    [demoUiComponentsService],
  );

  const debouncedFetchCountries = useMemo(
    () => debounce(fetchCountries, 300),
    [fetchCountries],
  );

  const submitSingleCountry = async () => {
    if (!singleCountry) return;
    const result = await demoUiComponentsService.sendAndGetSelectedCountries([
      singleCountry,
    ]);
    const messageHtml = result
      .map(
        (item: NameValueOfString) =>
          `<div><strong>id</strong>: ${item.value ?? ""} - <strong>name</strong>: ${item.name ?? ""}</div>`,
      )
      .join("");
    notification.info({
      message: L("PostedValue"),
      description: <div dangerouslySetInnerHTML={{ __html: messageHtml }} />,
    });
  };

  const submitMultiCountries = async () => {
    if (multiCountries.length === 0) return;
    const result =
      await demoUiComponentsService.sendAndGetSelectedCountries(multiCountries);
    const messageHtml = result
      .map(
        (item: NameValueOfString) =>
          `<div><strong>id</strong>: ${item.value ?? ""} - <strong>name</strong>: ${item.name ?? ""}</div>`,
      )
      .join("");
    notification.info({
      message: L("PostedValue"),
      description: <div dangerouslySetInnerHTML={{ __html: messageHtml }} />,
    });
  };

  return (
    <div className="card card-custom gutter-b mb-5">
      <div className="card-header align-items-center border-0">
        <h3 className="card-title align-items-start flex-column">
          <span className="fw-bolder text-gray-900">
            Ant Design Autocomplete
          </span>
        </h3>
      </div>
      <div className="card-body">
        <form role="form" className="form">
          {/* Single select */}
          <div className="mb-5 row">
            <label htmlFor="SingleSelectInput" className="col-lg-12 form-label">
              Single select
            </label>
            <div className="col-lg-10 col-md-9 col-sm-8">
              <AutoComplete
                id="SingleSelectInput"
                className="w-100"
                options={options}
                onSearch={debouncedFetchCountries}
                onSelect={(value, option) =>
                  setSingleCountry(
                    new NameValueOfString({ name: value, value: option.key }),
                  )
                }
                placeholder={L("Country")}
              />
            </div>
            <div className="col-lg-2 col-md-3 col-sm-4">
              <button
                className="btn btn-primary"
                type="button"
                onClick={submitSingleCountry}
              >
                {L("Submit")}
              </button>
            </div>
          </div>

          {/* Multi select */}
          <div className="mb-5 row">
            <label htmlFor="MultiSelectInput" className="col-lg-12 form-label">
              Multi select
            </label>
            <div className="col-lg-10 col-md-9 col-sm-8">
              <Select
                id="MultiSelectInput"
                mode="multiple"
                className="w-100"
                placeholder={L("Countries")}
                options={options}
                onSearch={debouncedFetchCountries}
                onChange={(_values, opts) => {
                  const arr: { value: string; label: string; key?: string }[] =
                    Array.isArray(opts)
                      ? (opts as {
                          value: string;
                          label: string;
                          key?: string;
                        }[])
                      : opts
                        ? ([
                            opts as {
                              value: string;
                              label: string;
                              key?: string;
                            },
                          ] as const)
                        : [];
                  const selected = arr.map(
                    (opt) =>
                      new NameValueOfString({
                        name: opt.label,
                        value: opt.key ?? opt.value,
                      }),
                  );
                  setMultiCountries(selected);
                }}
                loading={loading}
                filterOption={false}
                showSearch
              />
            </div>
            <div className="col-lg-2 col-md-3 col-sm-4">
              <button
                className="btn btn-primary"
                type="button"
                onClick={submitMultiCountries}
              >
                {L("Submit")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SelectionDemo;
