import React, { useState, useMemo } from "react";
import { Upload, message } from "antd";
import type { UploadProps, UploadFile } from "antd";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../app/store";
import L from "@/lib/L";

const FileUploadDemo: React.FC = () => {
  const authToken = useSelector((state: RootState) => state.auth.token);

  const uploadUrl = `${import.meta.env.VITE_API_BASE_URL}/DemoUiComponents/UploadFiles`;

  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);

  const uploadHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${authToken}`,
    }),
    [authToken],
  );

  const props: UploadProps = {
    name: "file",
    action: uploadUrl,
    headers: uploadHeaders,
    multiple: true,
    accept: "image/*",
    onChange(info) {
      if (info.file.status === "done") {
        message.success(`${info.file.name} ${L("FileUploadedSuccessfully")}`);
        setUploadedFiles((prev) => [...prev, info.file]);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} ${L("FileUploadFailed")}.`);
      }
    },
  };

  return (
    <div className="card card-custom gutter-b mb-5">
      <div className="card-header align-items-center border-0">
        <h3 className="card-title align-items-start flex-column">
          <span className="fw-bolder text-gray-900">{L("FileUpload")}</span>
        </h3>
      </div>
      <div className="card-body">
        <label
          className="form-label w-100"
          htmlFor="DefaultFileUploadFileInput"
        >
          Default file uploader
        </label>
        <Upload {...props} id="DefaultFileUploadFileInput">
          <button type="button" className="btn btn-primary">
            <i className="fa fa-upload me-2"></i>
            {L("Upload")}
          </button>
        </Upload>

        {uploadedFiles.length > 0 && (
          <ul className="mt-4">
            {uploadedFiles.map((file, index) => (
              <li key={index}>
                {file.name} - {file.size ? file.size : 0} bytes
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FileUploadDemo;
