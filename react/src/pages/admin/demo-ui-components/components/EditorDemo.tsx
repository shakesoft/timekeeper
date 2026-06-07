import React, { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { DemoUiComponentsServiceProxy } from "../../../../api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

const EditorDemo: React.FC = () => {
  const demoUiComponentsService = useServiceProxy(
    DemoUiComponentsServiceProxy,
    [],
  );

  const [editorContent, setEditorContent] = useState<string>("");

  const submitValue = async () => {
    const result = await demoUiComponentsService.sendAndGetValue(editorContent);
    abp.notify.info(result.output ?? "", L("PostedValue"));
  };

  return (
    <div className="card card-custom gutter-b mb-5">
      <div className="card-header align-items-center border-0">
        <h3 className="card-title align-items-start flex-column">
          <span className="fw-bolder text-gray-900">{L("Editor")}</span>
        </h3>
      </div>
      <div className="card-body">
        <ReactQuill
          theme="snow"
          value={editorContent}
          onChange={setEditorContent}
          style={{ height: "300px", marginBottom: "50px" }}
        />
      </div>
      <div className="card-footer">
        <button className="btn btn-primary" type="button" onClick={submitValue}>
          {L("Submit")}
        </button>
      </div>
    </div>
  );
};

export default EditorDemo;
