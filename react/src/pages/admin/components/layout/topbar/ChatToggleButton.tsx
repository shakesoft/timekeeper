import React from "react";
import classNames from "classnames";
import L from "@/lib/L";
import { useChatContext } from "../chat/hooks/useChatContext";

type Props = {
  className?: string;
  buttonClassName?: string;
  iconClassName?: string;
};

const ChatToggleButton: React.FC<Props> = ({
  className,
  buttonClassName = "btn btn-active-color-primary btn-active-light btn-custom btn-icon btn-icon-muted h-35px h-md-40px position-relative w-35px w-md-40px",
  iconClassName = "flaticon-chat-2 fs-4",
}) => {
  const chatFeatureEnabled = abp.features.get("App.ChatFeature");

  const { isConnected, totalUnreadCount, clearSelection } = useChatContext();

  if (!chatFeatureEnabled) return null;

  return (
    <>
      {!isConnected && (
        <div
          id="chat_is_connecting_icon"
          className={classNames(
            "d-flex align-items-center ms-1 ms-lg-3",
            className,
          )}
        >
          <button
            className={buttonClassName}
            onClick={() => {
              clearSelection();
            }}
          >
            <img
              src="/assets/common/images/loading.gif"
              style={{ width: 23 }}
              title={L("ChatIsConnecting")}
            />
          </button>
        </div>
      )}
      {isConnected && (
        <div
          className={classNames(
            "d-flex align-items-center ms-1 ms-lg-3",
            className,
          )}
        >
          <button
            className={classNames(buttonClassName, "unread-notification")}
            id="kt_drawer_chat_toggle"
            onClick={() => {
              clearSelection();
            }}
          >
            <i className={iconClassName}></i>
            {!!totalUnreadCount && (
              <span className="position-absolute top-0 start-100 translate-middle badge badge-circle badge-warning unread-chat-message-count">
                {totalUnreadCount}
              </span>
            )}
          </button>
        </div>
      )}
    </>
  );
};

export default ChatToggleButton;
