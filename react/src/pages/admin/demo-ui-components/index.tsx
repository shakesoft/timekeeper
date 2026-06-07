import React, { useState } from "react";
import { useSelector } from "react-redux";

import DateTimeDemo from "./components/DateTimeDemo";
import FileUploadDemo from "./components/FileUploadDemo";
import SelectionDemo from "./components/SelectionDemo";
import InputMaskDemo from "./components/InputMaskDemo";
import EditorDemo from "./components/EditorDemo";
import PageHeader from "../components/common/PageHeader";
import type { RootState } from "../../../app/store";
import L from "@/lib/L";

const DemoUiComponentsPage: React.FC = () => {
  const [alertVisible, setAlertVisible] = useState(true);
  const containerClass = useSelector(
    (state: RootState) => state.ui.containerClass,
  );

  const hideAlert = () => {
    setAlertVisible(false);
  };

  return (
    <div>
      <PageHeader title={L("DemoUiComponents")} />

      <div className={containerClass}>
        {alertVisible && (
          <div className="alert bg-light-primary d-flex align-items-center p-5 mb-10">
            <span className="svg-icon svg-icon-2hx svg-icon-primary me-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  opacity="0.3"
                  d="M2 4V16C2 16.6 2.4 17 3 17H13L16.6 20.6C17.1 21.1 18 20.8 18 20V17H21C21.6 17 22 16.6 22 16V4C22 3.4 21.6 3 21 3H3C2.4 3 2 3.4 2 4Z"
                  fill="black"
                ></path>
                <path
                  d="M18 9H6C5.4 9 5 8.6 5 8C5 7.4 5.4 7 6 7H18C18.6 7 19 7.4 19 8C19 8.6 18.6 9 18 9ZM16 12C16 11.4 15.6 11 15 11H6C5.4 11 5 11.4 5 12C5 12.6 5.4 13 6 13H15C15.6 13 16 12.6 16 12Z"
                  fill="black"
                ></path>
              </svg>
            </span>
            <div className="d-flex flex-column">
              <h4 className="mb-1 text-gray-900">
                {L("DemoUiComponents_Info")}
              </h4>
              <span>
                <a
                  href="https://keenthemes.com/metronic/"
                  className="alert-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {L("DemoUiComponents_Info_Metronic_Link_Text")}
                </a>
              </span>
            </div>
            <button
              type="button"
              className="position-absolute position-sm-relative m-2 m-sm-0 top-0 end-0 btn btn-icon ms-sm-auto"
              onClick={hideAlert}
            >
              <span className="svg-icon svg-icon-2x svg-icon-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <rect
                    opacity="0.5"
                    x="6"
                    y="17.3137"
                    width="16"
                    height="2"
                    rx="1"
                    transform="rotate(-45 6 17.3137)"
                    fill="black"
                  ></rect>
                  <rect
                    x="7.41422"
                    y="6"
                    width="16"
                    height="2"
                    rx="1"
                    transform="rotate(45 7.41422 6)"
                    fill="black"
                  ></rect>
                </svg>
              </span>
            </button>
          </div>
        )}

        <DateTimeDemo />
        <FileUploadDemo />
        <SelectionDemo />
        <InputMaskDemo />
        <EditorDemo />
      </div>
    </div>
  );
};

export default DemoUiComponentsPage;
