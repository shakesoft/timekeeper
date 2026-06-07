import { ChatMessageDto } from "@/api/service-proxy-factory";
import AppConsts from "@/lib/app-consts";
import LocalStorageHelper from "@/lib/local-storage-helper";
import React, { useEffect, useState } from "react";

type Props = {
  message: ChatMessageDto;
};

const ChatMessage: React.FC<Props> = ({ message }) => {
  const [kind, setKind] = useState<"text" | "image" | "file" | "link">("text");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const token = (() => {
      const authData = LocalStorageHelper.get<{ token?: string } | null>(
        AppConsts.authorization.encrptedAuthTokenName,
        null,
      );
      return authData?.token || "";
    })();
    const msg = message.message ?? "";
    if (msg.startsWith("[image]")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setKind("image");
      const image = JSON.parse(msg.substring("[image]".length));
      setContent(
        `${AppConsts.remoteServiceBaseUrl}/Chat/GetUploadedObject?fileId=${image.id}&fileName=${image.name}&contentType=${image.contentType}&enc_auth_token=${encodeURIComponent(token)}`,
      );
    } else if (msg.startsWith("[file]")) {
      setKind("file");
      const file = JSON.parse(msg.substring("[file]".length));
      setContent(
        `${AppConsts.remoteServiceBaseUrl}/Chat/GetUploadedObject?fileId=${file.id}&fileName=${file.name}&contentType=${file.contentType}&enc_auth_token=${encodeURIComponent(token)}`,
      );
      setFileName(file.name);
    } else if (msg.startsWith("[link]")) {
      setKind("link");
      const link = JSON.parse(msg.substring("[link]".length));
      setContent(link.message ?? "");
    } else {
      setKind("text");
      setContent(msg);
    }
  }, [message]);

  if (kind === "image") {
    return (
      <a href={content} target="_blank" rel="noreferrer">
        <img src={content} className="chat-image-preview" />
      </a>
    );
  }
  if (kind === "file") {
    return (
      <a
        href={content}
        target="_blank"
        rel="noreferrer"
        className="chat-file-preview"
      >
        <i className="fa fa-file" /> {fileName}
        <i className="fa fa-download pull-right" />
      </a>
    );
  }
  if (kind === "link") {
    return (
      <a
        href={content}
        target="_blank"
        rel="noreferrer"
        className="chat-link-message"
      >
        <i className="fa fa-link" /> {content}
      </a>
    );
  }
  return <span dangerouslySetInnerHTML={{ __html: content }} />;
};

export default ChatMessage;
