import AppConsts from "./app-consts";
import { FileDto } from "@api/generated/service-proxies";

export function downloadTempFile(file: FileDto) {
  const url = `${AppConsts.remoteServiceBaseUrl}/File/DownloadTempFile?fileType=${file.fileType}&fileToken=${file.fileToken}&fileName=${file.fileName}`;

  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.download = file.fileName!;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
