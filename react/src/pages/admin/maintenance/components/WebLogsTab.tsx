import React, { useState, useEffect, useCallback } from "react";
import { FileDto, WebLogServiceProxy } from "@api/generated/service-proxies";
import { downloadTempFile } from "../../../../lib/file-download-helper";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { setLoading } from "@/app/slices/authSlice";

const WebLogsTab: React.FC = () => {
  const webLogService = useServiceProxy(WebLogServiceProxy, []);

  const [logs, setLogs] = useState<string[]>([]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await webLogService.getLatestWebLogs();
      setLogs(result.latestWebLogLines ?? []);
    } finally {
      setLoading(false);
    }
  }, [webLogService]);

  const handleDownloadLogs = async () => {
    try {
      const result: FileDto = await webLogService.downloadWebLogs();

      downloadTempFile(result);
    } catch {
      void 0;
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getLogType = (log: string): string => {
    if (log.startsWith("DEBUG")) return "DEBUG";
    if (log.startsWith("INFO")) return "INFO";
    if (log.startsWith("WARN")) return "WARN";
    if (log.startsWith("ERROR")) return "ERROR";
    if (log.startsWith("FATAL")) return "FATAL";
    return "";
  };

  const getLogClass = (log: string): string => {
    if (log.startsWith("DEBUG")) return "badge bg-secondary me-2 text-white";
    if (log.startsWith("INFO")) return "badge bg-info me-2 text-white";
    if (log.startsWith("WARN")) return "badge bg-warning me-2 text-white";
    if (log.startsWith("ERROR")) return "badge bg-danger me-2 text-white";
    if (log.startsWith("FATAL")) return "badge bg-danger me-2 text-white";
    return "badge bg-secondary me-2 text-white";
  };

  return (
    <>
      <div className="row m-3">
        <div className="col-xl-6">
          <p className="mt-5">{L("WebSiteLogsHeaderInfo")}</p>
        </div>
        <div className="col-xl-6 text-end">
          <button
            className="btn btn-secondary me-2"
            onClick={handleDownloadLogs}
          >
            <i className="fa fa-download"></i>
            <span className="ms-2">{L("DownloadAll")}</span>
          </button>
          <button className="btn btn-primary" onClick={fetchLogs}>
            <i className="fa fa-sync"></i>
            <span className="ms-2">{L("Refresh")}</span>
          </button>
        </div>
      </div>
      <div className="row m-3">
        <div className="col-xl-12">
          <div
            className="web-log-view full-height"
            style={{
              padding: "10px",
              maxHeight: "500px",
              overflowY: "auto",
              overflowX: "auto",
              whiteSpace: "pre",
              fontFamily: "monospace",
            }}
          >
            {logs.map((log, index) => {
              const logType = getLogType(log);
              const rawContent = log.replace(logType, "").trim();
              return (
                <span key={index} className="log-line d-block mb-1">
                  {logType && (
                    <span className={getLogClass(log)}>{logType}</span>
                  )}
                  {rawContent}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default WebLogsTab;
