import React, { useState } from "react";
import { IMaskInput } from "react-imask";
import { DemoUiComponentsServiceProxy } from "../../../../api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

const InputMaskDemo: React.FC = () => {
  const demoUiComponentsService = useServiceProxy(
    DemoUiComponentsServiceProxy,
    [],
  );

  const [dateValue, setDateValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [serialValue, setSerialValue] = useState("");
  const [phoneExtValue, setPhoneExtValue] = useState("");

  const submitValue = async (value: string) => {
    const result = await demoUiComponentsService.sendAndGetValue(value);
    abp.message.info(`${L("PostedValue")}: ${result.output}`);
  };

  return (
    <div className="card card-custom gutter-b mb-5">
      <div className="card-header align-items-center border-0">
        <h3 className="card-title align-items-start flex-column">
          <span className="fw-bolder text-gray-900">{L("Input Mask")}</span>
        </h3>
      </div>
      <div className="card-body">
        <form role="form" className="form">
          {/* Date Mask */}
          <div className="mb-5 row">
            <label htmlFor="DateInputMask" className="col-lg-12 form-label">
              Date
            </label>
            <div className="col-lg-10 col-md-9 col-sm-8">
              <IMaskInput
                id="DateInputMask"
                className="form-control"
                mask="00/00/0000"
                placeholder="mm/dd/yyyy"
                value={dateValue}
                onAccept={(val: unknown) => setDateValue(String(val ?? ""))}
              />
            </div>
            <div className="col-lg-2 col-md-3 col-sm-4">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => submitValue(dateValue)}
              >
                {L("Submit")}
              </button>
            </div>
          </div>

          {/* Phone Mask */}
          <div className="mb-5 row">
            <label htmlFor="PhoneInputMask" className="col-lg-12 form-label">
              Phone
            </label>
            <div className="col-lg-10 col-md-9 col-sm-8">
              <IMaskInput
                id="PhoneInputMask"
                className="form-control"
                mask="(000) 000-0000"
                placeholder="(000) 000-0000"
                value={phoneValue}
                onAccept={(val: unknown) => setPhoneValue(String(val ?? ""))}
              />
            </div>
            <div className="col-lg-2 col-md-3 col-sm-4">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => submitValue(phoneValue)}
              >
                {L("Submit")}
              </button>
            </div>
          </div>

          {/* Phone Ext Mask */}
          <div className="mb-5 row">
            <label htmlFor="PhoneExtInputMask" className="col-lg-12 form-label">
              Phone Ext
            </label>
            <div className="col-lg-10 col-md-9 col-sm-8">
              <IMaskInput
                id="PhoneExtInputMask"
                className="form-control"
                mask="(000) 000-0000? x00000"
                placeholder="(000) 000-0000? x00000"
                value={phoneExtValue}
                onAccept={(val: unknown) => setPhoneExtValue(String(val ?? ""))}
              />
            </div>
            <div className="col-lg-2 col-md-3 col-sm-4">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => submitValue(phoneExtValue)}
              >
                {L("Submit")}
              </button>
            </div>
          </div>

          {/* Serial Mask */}
          <div className="mb-5 row">
            <label htmlFor="SerialInputMask" className="col-lg-12 form-label">
              Serial
            </label>
            <div className="col-lg-10 col-md-9 col-sm-8">
              <IMaskInput
                id="SerialInputMask"
                className="form-control"
                mask="a*-000-a000"
                placeholder="a*-000-a000"
                value={serialValue}
                onAccept={(val: unknown) => setSerialValue(String(val ?? ""))}
              />
            </div>
            <div className="col-lg-2 col-md-3 col-sm-4">
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => submitValue(serialValue)}
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

export default InputMaskDemo;
