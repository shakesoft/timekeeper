import React, { useCallback, useEffect, useState } from "react";
import { useQrLoginSignalR } from "@/hooks/useQrLoginSignalR";
import { useLoginService } from "./login.service";
import L from "@/lib/L";

interface QrAuthData {
  accessToken: string;
  encryptedAccessToken: string;
  expireInSeconds: number;
  refreshToken: string;
  refreshTokenExpireInSeconds: number;
}

function isQrAuthData(data: unknown): data is QrAuthData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.accessToken === "string" &&
    typeof d.encryptedAccessToken === "string" &&
    typeof d.expireInSeconds === "number" &&
    typeof d.refreshToken === "string" &&
    typeof d.refreshTokenExpireInSeconds === "number"
  );
}

const QrLoginSection: React.FC = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const { qrLoginAuthenticate } = useLoginService();

  useQrLoginSignalR({ autoStart: true, maxSessionSetCount: 5 });

  const handleGenerateQrCode = useCallback((url: unknown) => {
    if (typeof url === "string") {
      setQrCodeUrl(url);
    }
  }, []);

  const handleGetAuthData = useCallback(
    (authData: unknown) => {
      if (!isQrAuthData(authData)) {
        return;
      }

      qrLoginAuthenticate(authData);
    },
    [qrLoginAuthenticate],
  );

  useEffect(() => {
    abp?.event?.on?.("app.qrlogin.generateQrCode", handleGenerateQrCode);
    abp?.event?.on?.("app.qrlogin.getAuthData", handleGetAuthData);

    return () => {
      abp?.event?.off?.("app.qrlogin.generateQrCode", handleGenerateQrCode);
      abp?.event?.off?.("app.qrlogin.getAuthData", handleGetAuthData);
    };
  }, [handleGenerateQrCode, handleGetAuthData]);

  return (
    <div className="d-flex justify-content-center align-items-center h-100">
      <div className="card justify-content-center align-items-center p-4">
        {qrCodeUrl ? (
          <div className="text-center">
            <img
              src={qrCodeUrl}
              alt={L("QrLogin")}
              width={250}
              height={250}
              className="mb-4"
            />
            <p className="text-center fs-4 mb-0">
              {L("ScanQrCodeWithYourMobileApp")}
            </p>
          </div>
        ) : (
          <div
            className="text-center p-10"
            role="status"
            aria-label={L("PleaseWait")}
          >
            <i
              className="fas fa-circle-notch fa-3x fa-spin text-primary"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QrLoginSection;
