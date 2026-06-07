import React, { useEffect, useState } from "react";
import type { ChatFriend } from "./types";
import L from "@/lib/L";
import {
  ProfileServiceProxy,
  useServiceProxy,
} from "@/api/service-proxy-factory";
import AppConsts from "@/lib/app-consts";

type Props = {
  friend: ChatFriend;
  onClick: () => void;
};

const ChatFriendListItem: React.FC<Props> = ({ friend, onClick }) => {
  const profileService = useServiceProxy(ProfileServiceProxy, []);
  const [profilePicture, setProfilePicture] = useState<string>(
    `${AppConsts.appBaseUrl}/assets/common/images/default-profile-picture.png`,
  );

  useEffect(() => {
    let mounted = true;
    profileService
      .getFriendProfilePicture(
        friend.friendUserId,
        friend.friendTenantId ?? undefined,
      )
      .then((res) => {
        if (!mounted) return;
        if (res?.profilePicture) {
          setProfilePicture(`data:image/jpeg;base64,${res.profilePicture}`);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [friend.friendUserId, friend.friendTenantId, profileService]);

  return (
    <div
      className="d-flex align-items-center chat-user py-4"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className="symbol symbol-45px symbol-circle">
        <img
          src={profilePicture}
          alt={friend.friendUserName}
          className="symbol symbol-45px symbol-circle"
        />
        <div
          className={`symbol-badge ${friend.isOnline ? "bg-success" : "bg-secondary"} start-100 top-100 border-4 h-15px w-15px ms-n2 mt-n2`}
        />
      </div>
      <div className="ms-5">
        <a className="fs-5 fw-bolder text-gray-900 text-hover-primary mb-2">
          {friend.friendUserName}
        </a>
        <div className="fw-bold text-muted">
          <span className="text-muted fw-bold fs-sm">
            {friend.friendTenancyName || L("Host")}
          </span>
        </div>
      </div>
      {!!friend.unreadMessageCount && (
        <div className="ms-auto">
          <span className="badge badge-circle badge-warning">
            {friend.unreadMessageCount}
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatFriendListItem;
