import React from "react";
import {
  FriendshipState,
  BlockUserInput,
  UnblockUserInput,
  FriendshipServiceProxy,
} from "@/api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import { useChatContext } from "./hooks/useChatContext";
import L from "@/lib/L";

type ToolbarActionsProps = {
  currentState: FriendshipState | undefined;
  setCurrentState: (state: FriendshipState | undefined) => void;
};

const ChatToolbarActions: React.FC<ToolbarActionsProps> = ({
  currentState,
  setCurrentState,
}) => {
  const { selectedUser, clearSelection, reload, selectFriend } =
    useChatContext();
  const friendshipSvc = useServiceProxy(FriendshipServiceProxy, []);

  const handleBack = () => clearSelection();

  const block = async () => {
    if (!selectedUser) return;

    setCurrentState(FriendshipState.Blocked);

    const input = new BlockUserInput();
    input.tenantId = selectedUser.friendTenantId ?? undefined;
    input.userId = selectedUser.friendUserId;
    await friendshipSvc.blockUser(input);
    abp.notify?.info?.(L("UserBlocked"));
    await reload();
    clearSelection();
  };

  const unblock = async () => {
    if (!selectedUser) return;

    setCurrentState(FriendshipState.Accepted);

    const input = new UnblockUserInput();
    input.tenantId = selectedUser.friendTenantId ?? undefined;
    input.userId = selectedUser.friendUserId;
    await friendshipSvc.unblockUser(input);
    abp.notify?.info?.(L("UserUnblocked"));
    const updatedList = await reload();
    const updatedFriend = updatedList?.find(
      (f) =>
        f.friendUserId === selectedUser.friendUserId &&
        (f.friendTenantId ?? null) === (selectedUser.friendTenantId ?? null),
    );
    if (updatedFriend) {
      selectFriend(updatedFriend);
    }
  };

  const remove = async () => {
    if (!selectedUser) return;
    await friendshipSvc.removeFriend(
      selectedUser.friendUserId,
      selectedUser.friendTenantId ?? null,
    );
    await reload();
    clearSelection();
  };

  return (
    <div className="card-toolbar d-flex gap-2">
      <a
        href="#"
        className="btn w-25px w-lg-40px h-25px h-lg-40px btn-icon btn-light btn-hover-primary quick-sidebar-back"
        title={L("Back")}
        onClick={(e) => {
          e.preventDefault();
          handleBack();
        }}
      >
        <i className="fa fa-arrow-alt-circle-left" aria-label={L("Back")} />
      </a>
      {currentState === FriendshipState.Accepted && (
        <a
          href="#"
          className="btn w-25px w-lg-40px h-25px h-lg-40px btn-icon btn-light btn-hover-primary quick-sidebar-back"
          title={L("Block")}
          onClick={(e) => {
            e.preventDefault();
            block();
          }}
        >
          <i className="fa fa-ban" aria-label={L("Block")}></i>
        </a>
      )}
      {currentState === FriendshipState.Blocked && (
        <a
          href="#"
          className="btn w-25px w-lg-40px h-25px h-lg-40px btn-icon btn-light btn-hover-primary quick-sidebar-back"
          title={L("Unblock")}
          onClick={(e) => {
            e.preventDefault();
            unblock();
          }}
        >
          <i className="fa fa-check" aria-label={L("Unblock")}></i>
        </a>
      )}
      <a
        href="#"
        className="btn w-25px w-lg-40px h-25px h-lg-40px btn-icon btn-light btn-hover-primary quick-sidebar-back"
        title={L("Remove")}
        onClick={(e) => {
          e.preventDefault();
          remove();
        }}
      >
        <i className="fas fa-minus-circle" aria-label={L("Remove")} />
      </a>
      <a
        href="#"
        className="btn w-25px w-lg-40px h-25px h-lg-40px btn-icon btn-light btn-hover-primary"
        id="kt_drawer_chat_close"
        title={L("Close")}
      >
        <i className="flaticon2-delete" />
      </a>
    </div>
  );
};

export default ChatToolbarActions;
