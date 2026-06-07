import React, { useCallback, useState } from "react";
import { InstallServiceProxy } from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";

const ConnectionFailedPage: React.FC = () => {
  const installService = useServiceProxy(InstallServiceProxy, []);
  const [checking, setChecking] = useState(false);

  const checkServer = useCallback(async () => {
    setChecking(true);
    try {
      await installService.getAppSettingsJson();
      window.location.href = "/";
    } catch {
      abp?.message?.error?.("Server is not up yet! Please try again later.");
    } finally {
      setChecking(false);
    }
  }, [installService]);

  return (
    <div
      className="bg-gradient-connection-failed"
      style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
    >
      <div
        className="content-container d-flex container align-items-stretch justify-content-between flex-wrap"
        style={{ gap: 24 }}
      >
        <div className="left-content" style={{ maxWidth: 520 }}>
          <h1 className="fw-bolder mb-3" style={{ fontSize: 56 }}>
            Oops!
          </h1>
          <h3 className="fw-bold mb-3">Unable to Connect to the Server</h3>
          <p className="text-muted mb-6">
            Please contact your administrator for assistance.
          </p>
          <button
            className="btn btn-primary"
            onClick={checkServer}
            disabled={checking}
          >
            {checking ? "Checking..." : "Try again"}
          </button>
        </div>
        <div className="right-content flex-grow-1" />
      </div>
    </div>
  );
};

export default ConnectionFailedPage;
