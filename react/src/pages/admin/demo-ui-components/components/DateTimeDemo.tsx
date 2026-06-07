import React, { useState } from "react";
import { DatePicker } from "antd";
import {
  formatDate,
  getStartOfDay,
  getStartOfDayMinusDays,
} from "../../components/common/timing/lib/datetime-helper";
import {
  DemoUiComponentsServiceProxy,
  SendAndGetDateWithTextInput,
} from "../../../../api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { Dayjs } from "dayjs";
import AppConsts from "@/lib/app-consts";

const { RangePicker } = DatePicker;

const DateTimeDemo: React.FC = () => {
  const demoUiComponentsService = useServiceProxy(
    DemoUiComponentsServiceProxy,
    [],
  );

  const [sampleDate, setSampleDate] = useState<Dayjs | null>(getStartOfDay());
  const [sampleDateTime, setSampleDateTime] = useState<Dayjs | null>(
    getStartOfDay(),
  );
  const [sampleDateRange, setSampleDateRange] = useState<[Dayjs, Dayjs]>([
    getStartOfDayMinusDays(7),
    getStartOfDay(),
  ]);
  const [sampleDateWithTextInput, setSampleDateWithTextInput] =
    useState<SendAndGetDateWithTextInput>(
      new SendAndGetDateWithTextInput({
        text: "This is a sample text",
        date: getStartOfDay(),
      }),
    );

  const getDateString = (date: Dayjs): string => {
    return formatDate(date, AppConsts.timing.longDateFormat);
  };

  const submitDate = async () => {
    if (!sampleDate) return;
    const result = await demoUiComponentsService.sendAndGetDate(sampleDate);
    abp.message.info(`${L("PostedValue")}: ${getDateString(result.date)}`);
  };

  const submitDateTime = async () => {
    if (!sampleDateTime) return;
    const result = await demoUiComponentsService.sendAndGetDate(sampleDateTime);
    abp.message.info(`${L("PostedValue")}: ${getDateString(result.date)}`);
  };

  const submitDateRange = async () => {
    if (!sampleDateRange) return;
    const result = await demoUiComponentsService.sendAndGetDateRange(
      sampleDateRange[0],
      sampleDateRange[1],
    );
    const dateString = `${getDateString(result.startDate)} - ${getDateString(result.endDate)}`;
    abp.message.info(`${L("PostedValue")}: ${dateString}`);
  };

  const submitDateWithText = async () => {
    if (!sampleDateWithTextInput.date || !sampleDateWithTextInput.text) return;
    const result = await demoUiComponentsService.sendAndGetDateWithText(
      sampleDateWithTextInput,
    );
    const resultString = `${getDateString(result.date)} - ${result.text}`;
    abp.message.info(`${L("PostedValue")}: ${resultString}`);
  };

  return (
    <div className="card card-custom gutter-b mb-5">
      <div className="card-header align-items-center border-0">
        <h3 className="card-title align-items-start flex-column">
          <span className="fw-bolder text-gray-900">
            {L("DateAndTimePickers")}
          </span>
        </h3>
      </div>
      <div className="card-body">
        <form role="form" className="form">
          {/* Default date picker */}
          <div className="mb-5 row">
            <label htmlFor="SampleDatePicker" className="col-md-12 form-label">
              Default date picker
            </label>
            <div className="col-lg-10 col-md-9 col-sm-8">
              <DatePicker
                className="form-control d-inline-flex"
                value={sampleDate}
                onChange={(date) => setSampleDate(date)}
              />
            </div>
            <div className="col-lg-2 col-md-3 col-sm-4">
              <button
                className="btn btn-primary"
                type="button"
                onClick={submitDate}
                disabled={!sampleDate}
              >
                {L("Submit")}
              </button>
            </div>
          </div>
        </form>

        <form role="form" className="form">
          {/* Default date time picker */}
          <div className="mb-5 row">
            <label
              htmlFor="SampleDateTimePicker"
              className="col-md-12 form-label"
            >
              Default date time picker
            </label>
            <div className="col-lg-10 col-md-9 col-sm-8">
              <DatePicker
                className="form-control d-inline-flex"
                value={sampleDateTime}
                onChange={(date) => setSampleDateTime(date)}
                showTime={true}
              />
            </div>
            <div className="col-lg-2 col-md-3 col-sm-4">
              <button
                className="btn btn-primary"
                type="button"
                onClick={submitDateTime}
                disabled={!sampleDateTime}
              >
                {L("Submit")}
              </button>
            </div>
          </div>
        </form>

        <form>
          {/* Default daterange picker */}
          <div className="mb-5 row">
            <label
              htmlFor="SampleDateRangePicker"
              className="col-md-12 form-label"
            >
              Default daterange picker
            </label>
            <div className="col-lg-10 col-md-9 col-sm-8">
              <RangePicker
                className="form-control d-inline-flex"
                value={sampleDateRange}
                onChange={(dates) => {
                  const d = dates as [Dayjs | null, Dayjs | null] | null;
                  if (d && d[0] && d[1]) {
                    setSampleDateRange([d[0], d[1]]);
                  }
                }}
              />
            </div>
            <div className="col-lg-2 col-md-3 col-sm-4">
              <button
                className="btn btn-primary"
                type="button"
                onClick={submitDateRange}
                disabled={!sampleDateRange}
              >
                {L("Submit")}
              </button>
            </div>
          </div>
        </form>

        <form>
          {/* Date picker with text */}
          <h5 className="col-md-12">Date picker with text</h5>
          <div className="col-12">
            <div className="row">
              <div className="col-5">
                <label
                  htmlFor="SampleDatePickerWithText"
                  className="form-label"
                >
                  Date
                </label>
                <DatePicker
                  className="form-control d-inline-flex"
                  value={sampleDateWithTextInput.date}
                  onChange={(date) =>
                    setSampleDateWithTextInput(
                      (prev: SendAndGetDateWithTextInput) =>
                        date
                          ? new SendAndGetDateWithTextInput({ ...prev, date })
                          : prev,
                    )
                  }
                />
              </div>
              <div className="col-5">
                <label htmlFor="textValue" className="form-label">
                  Text
                </label>
                <input
                  id="textValue"
                  className="form-control"
                  value={sampleDateWithTextInput.text}
                  onChange={(e) =>
                    setSampleDateWithTextInput(
                      (prev: SendAndGetDateWithTextInput) =>
                        new SendAndGetDateWithTextInput({
                          ...prev,
                          text: e.target.value,
                        }),
                    )
                  }
                />
              </div>
              <div className="col-2">
                <button
                  className="btn btn-primary mt-8"
                  type="button"
                  onClick={submitDateWithText}
                  disabled={
                    !sampleDateWithTextInput.date ||
                    !sampleDateWithTextInput.text
                  }
                >
                  {L("Submit")}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DateTimeDemo;
