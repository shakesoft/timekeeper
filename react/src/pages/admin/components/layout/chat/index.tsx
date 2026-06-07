import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { Upload } from "antd";
import { useChatContext } from "./hooks/useChatContext";
import {
  FriendshipState,
  ChatSide,
  ProfileServiceProxy,
} from "../../../../../api/generated/service-proxies";
import ChatMessage from "./ChatMessage";
import ChatFriendListItem from "./ChatFriendListItem";
import ChatToolbarActions from "./ChatToolbarActions";
import AddFriendModal from "./AddFriendModal";
import L from "@/lib/L";
import "./chat-bar.css";
import { useServiceProxy } from "@/api/service-proxy-factory";
import AppConsts from "@/lib/app-consts";

type Props = {
  embedded?: boolean;
};

const ChatBar: React.FC<Props> = ({ embedded = false }) => {
  const {
    friends,
    selectedUser,
    pinned,
    profilePicture,
    userNameFilter,
    setUserNameFilter,
    selectFriend,
    reversePinned,
    sendMessage,
    getShownUserName,
  } = useChatContext();

  const profileService = useServiceProxy(ProfileServiceProxy, []);
  const [chatMessage, setChatMessage] = useState("");
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [friendProfilePicture, setFriendProfilePicture] = useState<string>(
    `${AppConsts.appBaseUrl}/assets/common/images/default-profile-picture.png`,
  );
  const [currentState, setCurrentState] = useState<FriendshipState | undefined>(
    selectedUser?.state,
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentState(selectedUser?.state);
  }, [selectedUser?.state]);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollMessagesToBottom = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } catch {
      el.scrollTop = el.scrollHeight;
    }
  };

  const acceptedFriends = friends.filter(
    (f) =>
      f.state === FriendshipState.Accepted &&
      getShownUserName(f.friendTenancyName || "", f.friendUserName || "")
        .toLowerCase()
        .includes(userNameFilter.toLowerCase()),
  );
  const blockedFriends = friends.filter(
    (f) =>
      f.state === FriendshipState.Blocked &&
      getShownUserName(f.friendTenancyName || "", f.friendUserName || "")
        .toLowerCase()
        .includes(userNameFilter.toLowerCase()),
  );

  const handleSend = async () => {
    if (!chatMessage) return;

    if (currentState === FriendshipState.Blocked) {
      abp.notify?.warn?.(L("YouCannotSendMessageToBlockedUser"));
      return;
    }

    await sendMessage(chatMessage);
    setChatMessage("");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollMessagesToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedUser?.friendUserId, selectedUser?.messages?.length]);

  useEffect(() => {
    if (!selectedUser?.friendUserId) return;
    let mounted = true;
    profileService
      .getFriendProfilePicture(
        selectedUser.friendUserId,
        selectedUser.friendTenantId ?? undefined,
      )
      .then((res) => {
        if (!mounted) return;
        if (res?.profilePicture) {
          setFriendProfilePicture(
            `data:image/jpeg;base64,${res.profilePicture}`,
          );
        } else {
          setFriendProfilePicture(
            `${AppConsts.appBaseUrl}/assets/common/images/default-profile-picture.png`,
          );
        }
      })
      .catch(() => {
        if (mounted) {
          setFriendProfilePicture(
            `${AppConsts.appBaseUrl}/assets/common/images/default-profile-picture.png`,
          );
        }
      });
    return () => {
      mounted = false;
    };
  }, [
    selectedUser?.friendUserId,
    selectedUser?.friendTenantId,
    profileService,
  ]);

  const shareCurrentLink = async () => {
    const linkMessage = `[link]{"message":"${window.location.href}"}`;
    await sendMessage(linkMessage);
  };

  const handleUpload = async (file: File, isImage: boolean) => {
    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      if (!isImage) formData.append("isImage", "false");
      const response = await fetch(
        `${window.location.origin}/Chat/UploadFile`.replace(
          window.location.origin,
          import.meta.env.VITE_API_URL ||
            import.meta.env.VITE_API_BASE_URL ||
            "",
        ),
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${abp.auth.getToken() || ""}`,
          },
        },
      );
      const data = await response.json();
      const result = data?.result || data;
      let message: string;
      if (isImage) {
        message = `[image]{"id":"${result.id}", "name":"${result.name}", "contentType":"${result.contentType}"}`;
      } else {
        message = `[file]{"id":"${result.id}", "name":"${result.name}", "contentType":"${result.contentType}"}`;
      }
      await sendMessage(message);
    } catch {
      abp.message?.error?.(L("AnErrorOccurredWhileUploadingTheImage"));
    }
  };

  const content = (
    <>
      {!selectedUser?.friendUserId && (
        <div className="card card-flush w-100" id="kt_drawer_chat_friends">
          <div className="card-header pt-7" id="kt_chat_contacts_header">
            <div className="card-title">
              <div className="position-relative">
                <span className="svg-icon svg-icon-2 svg-icon-lg-1 svg-icon-gray-500 position-absolute top-50 ms-5 translate-middle-y">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <rect
                      opacity="0.5"
                      x="17.0365"
                      y="15.1223"
                      width="8.15546"
                      height="2"
                      rx="1"
                      transform="rotate(45 17.0365 15.1223)"
                      fill="black"
                    ></rect>
                    <path
                      d="M11 19C6.55556 19 3 15.4444 3 11C3 6.55556 6.55556 3 11 3C15.4444 3 19 6.55556 19 11C19 15.4444 15.4444 19 11 19ZM11 5C7.53333 5 5 7.53333 5 11C5 14.4667 7.53333 17 11 17C14.4667 17 17 14.4667 17 11C17 7.53333 14.4667 5 11 5Z"
                      fill="black"
                    ></path>
                  </svg>
                </span>
                <input
                  type="text"
                  id="ChatUserSearchUserName"
                  className="form-control form-control-solid px-15 h-25px h-lg-40px"
                  name="search"
                  placeholder={L("Filter")}
                  value={userNameFilter}
                  onChange={(e) => setUserNameFilter(e.target.value)}
                />
              </div>
            </div>
            <div className="card-toolbar justify-content-end d-flex gap-2">
              <a
                href="#"
                id="SearchChatUserButton"
                onClick={(e) => {
                  e.preventDefault();
                  setAddModalOpen(true);
                }}
                className="btn w-25px w-lg-40px h-25px h-lg-40px btn-icon btn-light btn-hover-primary"
                title={L("AddFriend")}
              >
                <i className="fas fa-user-plus" />
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  reversePinned();
                }}
                className="btn w-25px w-lg-40px h-25px h-lg-40px btn-icon btn-light btn-hover-primary page-quick-sidebar-pinner"
              >
                <i
                  className={classNames("fa fa-map-pin", {
                    "fa-rotate-90": !pinned,
                  })}
                  aria-label={L("Pin")}
                />
              </a>
              <a
                href="#"
                className="btn w-25px w-lg-40px h-25px h-lg-40px btn-icon btn-light btn-hover-primary"
                id="kt_drawer_chat_close"
              >
                <i className="flaticon2-delete" />
              </a>
            </div>
          </div>
          <div className="card-body pt-5" id="kt_chat_contacts_body">
            <div
              className="scroll-y pe-5 chat-users"
              style={{ maxHeight: 400, overflowY: "auto" }}
            >
              {acceptedFriends.map((friend) => (
                <div key={`${friend.friendTenantId}-${friend.friendUserId}`}>
                  <ChatFriendListItem
                    friend={friend}
                    onClick={() => selectFriend(friend)}
                  />
                </div>
              ))}
              {acceptedFriends.length === 0 && (
                <p id="EmptyFriendListInfo">{L("YouDontHaveAnyFriend")}</p>
              )}
            </div>
            <div className="mt-4">
              <h5>{L("BlockedUsers")}</h5>
              <div
                className="scroll-y pe-5 chat-users"
                style={{ maxHeight: 300, overflowY: "auto" }}
              >
                {blockedFriends.map((friend) => (
                  <div
                    key={`b-${friend.friendTenantId}-${friend.friendUserId}`}
                    className="d-flex flex-stack py-2"
                  >
                    <div
                      className="d-flex align-items-center chat-user"
                      style={{ cursor: "pointer" }}
                      onClick={() => selectFriend(friend)}
                    >
                      <div className="symbol symbol-45px symbol-circle">
                        <img
                          src={profilePicture}
                          alt={friend.friendUserName}
                          className="symbol symbol-45px symbol-circle"
                        />
                        <div
                          className={`symbol-badge ${
                            friend.isOnline ? "bg-success" : "bg-secondary"
                          } start-100 top-100 border-4 h-15px w-15px ms-n2 mt-n2`}
                        />
                      </div>
                      <div className="ms-3">
                        <div className="fw-bolder">{friend.friendUserName}</div>
                        <div className="text-muted fs-sm">
                          {friend.friendTenancyName || L("Host")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {blockedFriends.length === 0 && (
                  <p id="EmptyBlockedFriendListInfo">
                    {L("YouDontHaveAnyBlockedFriend")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedUser?.friendUserId && (
        <div
          className="card w-100 rounded-0 border-0 d-flex flex-column h-100"
          id="kt_drawer_chat_messenger"
        >
          <div
            className="card-header pe-5"
            id="kt_drawer_chat_messenger_header"
          >
            <div className="card-title">
              <div className="d-flex justify-content-center flex-column me-3">
                <a
                  href="#"
                  id="selectedChatUserName"
                  className="fs-4 fw-bolder text-gray-900 me-1 mb-2 lh-1"
                >
                  {selectedUser &&
                    getShownUserName(
                      selectedUser.friendTenancyName || "",
                      selectedUser.friendUserName || "",
                    )}
                </a>
                <div className="mb-0 lh-1" id="selectedChatUserStatus">
                  {selectedUser?.isOnline ? (
                    <span className="badge badge-success badge-circle w-10px h-10px me-1" />
                  ) : (
                    <span className="badge badge-secondary badge-circle w-10px h-10px me-1" />
                  )}
                  <span className="fs-7 fw-bold text-muted">
                    {selectedUser?.isOnline ? L("Online") : L("Offline")}
                  </span>
                </div>
              </div>
            </div>
            <div className="card-toolbar d-flex gap-2">
              <ChatToolbarActions
                currentState={currentState}
                setCurrentState={setCurrentState}
              />
            </div>
          </div>

          <div className="card-body py-0 d-flex flex-column">
            <div
              id="kt_drawer_chat_messenger_body"
              className="scroll-y me-n5 pe-5 pt-5 flex-grow-1"
              ref={messagesContainerRef}
            >
              <div className="messages" id="UserChatMessages">
                {(selectedUser?.messages ?? []).map((m) => (
                  <div key={m.id}>
                    {m.side === ChatSide.Sender ? (
                      <div className="d-flex flex-column mb-5 align-items-end">
                        <div className="d-flex align-items-center mb-2">
                          <div className="symbol symbol-circle symbol-35px me-3">
                            <img alt="Pic" src={profilePicture} />
                          </div>
                          <div>
                            <a
                              href="#"
                              className="fs-5 fw-bolder text-gray-900 me-1"
                            >
                              {L("You")}
                            </a>
                          </div>
                        </div>
                        <div className="p-5 rounded bg-light-info text-gray-900 fw-bold mw-lg-400px text-start">
                          <ChatMessage message={m} />
                        </div>
                      </div>
                    ) : (
                      <div className="d-flex flex-column mb-5 align-items-start">
                        <div className="d-flex align-items-center mb-2">
                          <div className="symbol symbol-circle symbol-35px">
                            <img src={friendProfilePicture} />
                          </div>
                          <div className="ms-3">
                            <a
                              href="#"
                              role="button"
                              className="fs-5 fw-bolder text-gray-900 me-1"
                              onClick={(e) => e.preventDefault()}
                            >
                              {selectedUser?.friendUserName}
                            </a>
                          </div>
                        </div>
                        <div className="p-5 rounded bg-light-primary text-gray-900 fw-bold mw-lg-400px text-end">
                          <ChatMessage message={m} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="card-footer pt-4"
            id="kt_drawer_chat_messenger_footer"
          >
            <div>
              <textarea
                id="ChatMessage"
                rows={2}
                className="form-control form-control-flush mb-3"
                placeholder={L("TypeAMessageHere")}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                maxLength={4096}
              />
              <div className="d-flex flex-stack mt-2">
                <div className="d-flex align-items-center me-2 chat-file-upload">
                  <Upload
                    showUploadList={false}
                    beforeUpload={async (file) => {
                      await handleUpload(file as File, false);
                      return Upload.LIST_IGNORE;
                    }}
                  >
                    <a
                      href="#"
                      className="btn btn-sm btn-icon btn-active-light-primary me-1 mb-3"
                      title={L("File")}
                      onClick={(e) => e.preventDefault()}
                    >
                      <span className="fileinput-button">
                        <i className="fas fa-paperclip fs-3" />
                      </span>
                    </a>
                  </Upload>
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={async (file) => {
                      await handleUpload(file as File, true);
                      return Upload.LIST_IGNORE;
                    }}
                  >
                    <a
                      href="#"
                      className="btn btn-sm btn-icon btn-active-light-primary me-1 mb-3"
                      title={L("Image")}
                      onClick={(e) => e.preventDefault()}
                    >
                      <span className="fileinput-button">
                        <i className="fas fa-camera-retro fs-3" />
                      </span>
                    </a>
                  </Upload>

                  <a
                    href="#"
                    className="btn btn-sm btn-icon btn-active-light-primary me-1"
                    id="btnLinkShare"
                    title={L("LinkToCurrentPage")}
                    onClick={(e) => {
                      e.preventDefault();
                      shareCurrentLink();
                    }}
                  >
                    <span className="fileinput-button">
                      <i className="fas fa-link fs-3" />
                    </span>
                  </a>
                </div>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleSend}
                >
                  {L("Reply")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <AddFriendModal
        open={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </>
  );

  return embedded ? (
    <>{content}</>
  ) : (
    <div
      id="kt_drawer_chat"
      className="bg-body drawer drawer-end"
      data-kt-drawer="true"
      data-kt-drawer-name="chat"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'300px', 'md': '500px'}"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#kt_drawer_chat_toggle"
      data-kt-drawer-close="#kt_drawer_chat_close"
    >
      {content}
    </div>
  );
};

export default ChatBar;
