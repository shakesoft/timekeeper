import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatFriend } from "../types";
import type { HubConnection } from "@microsoft/signalr";
import {
  ChatMessageDto,
  ChatMessageReadState,
  ChatServiceProxy,
  ChatSide,
  FriendDto,
  FriendshipState,
  MarkAllUnreadMessagesOfUserAsReadInput,
  ProfileServiceProxy,
  useServiceProxy,
} from "@/api/service-proxy-factory";
import AppConsts from "@/lib/app-consts";
import SignalRHelper from "@/lib/signalr-helper";
import { useSession } from "@/hooks/useSession";
import LocalStorageHelper from "@/lib/local-storage-helper";
import L from "@/lib/L";

export interface UseChatState {
  friends: ChatFriend[];
  selectedUser: ChatFriend | null;
  isOpen: boolean;
  pinned: boolean;
  profilePicture: string;
  userNameFilter: string;
  setUserNameFilter: (v: string) => void;
  selectFriend: (f: FriendDto) => void;
  clearSelection: () => void;
  reversePinned: () => void;
  sendMessage: (text: string) => Promise<void>;
  markAllUnread: (user: ChatFriend) => void;
  getShownUserName: (
    tenancyName: string | undefined | null,
    userName: string,
  ) => string;
  reload: () => Promise<ChatFriend[]>;
  isConnected: boolean;
  totalUnreadCount: number;
  toggleOpen: () => void;
}

export function useChat(): UseChatState {
  const chatSvc = useServiceProxy(ChatServiceProxy, []);
  const profileSvc = useServiceProxy(ProfileServiceProxy, []);
  const { user, tenant } = useSession();
  const [friends, setFriends] = useState<ChatFriend[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatFriend | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(
    LocalStorageHelper.get("app.chat.isOpen", false),
  );
  const [pinned, setPinned] = useState<boolean>(
    LocalStorageHelper.get("app.chat.pinned", false),
  );
  const [profilePicture, setProfilePicture] = useState<string>(
    `${AppConsts.appBaseUrl}/assets/common/images/default-profile-picture.png`,
  );
  const [userNameFilter, setUserNameFilter] = useState("");
  const connectionRef = useRef<HubConnection | null>(null);
  const initOnceRef = useRef<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);

  const getShownUserName = useCallback(
    (tenancyName: string | null | undefined, userName: string) => {
      const isMultiTenancyEnabled = abp?.multiTenancy?.isEnabled;
      if (!isMultiTenancyEnabled) return userName;
      return `${tenancyName ? tenancyName : "."}\\${userName}`;
    },
    [],
  );

  const getFriendOrNull = useCallback(
    (userId?: number, tenantId?: number | null): ChatFriend | null => {
      if (!userId) return null;
      const f = friends.find(
        (x) =>
          x.friendUserId === userId &&
          (x.friendTenantId ?? null) === (tenantId ?? null),
      );
      return f ?? null;
    },
    [friends],
  );

  const markAllUnread = useCallback(
    async (user: ChatFriend) => {
      if (!user) return;
      const unreadIds = (user.messages ?? [])
        .filter((m) => m.readState === ChatMessageReadState.Unread)
        .map((m) => m.id);
      if (unreadIds.length === 0) return;
      const input = new MarkAllUnreadMessagesOfUserAsReadInput();
      input.tenantId = user.friendTenantId;
      input.userId = user.friendUserId;
      await chatSvc.markAllUnreadMessagesOfUserAsRead(input);

      const userUnreadCount = user.unreadMessageCount ?? 0;

      setFriends((prev) =>
        prev.map((f) => {
          if (f === user) {
            const updated = {
              ...f,
              unreadMessageCount: 0,
              messages: (f.messages ?? []).map(
                (m) =>
                  ({
                    ...m,
                    readState: ChatMessageReadState.Read,
                  }) as ChatMessageDto,
              ),
            } as ChatFriend;
            return updated;
          }
          return f;
        }),
      );

      setTotalUnreadCount((prev) => Math.max(0, prev - userUnreadCount));
    },
    [chatSvc],
  );

  const selectFriend = useCallback(
    async (friend: FriendDto) => {
      const chatUser = getFriendOrNull(
        friend.friendUserId,
        friend.friendTenantId ?? undefined,
      );

      if (!chatUser) return;

      setSelectedUser(chatUser);
      LocalStorageHelper.set("app.chat.selectedUser", friend);

      if (!chatUser.messagesLoaded) {
        try {
          const history = await chatSvc.getUserChatMessages(
            chatUser.friendTenantId ?? null,
            chatUser.friendUserId,
            undefined,
            50,
          );
          const messages = (history.items ?? []) as ChatMessageDto[];
          let updatedSelected: ChatFriend | null = null;
          setFriends((prev) =>
            prev.map((f) => {
              if (
                f.friendUserId === chatUser.friendUserId &&
                (f.friendTenantId ?? null) === (chatUser.friendTenantId ?? null)
              ) {
                const updated: ChatFriend = {
                  ...f,
                  messages,
                  messagesLoaded: true,
                  allPreviousMessagesLoaded: messages.length < 50,
                } as ChatFriend;
                updatedSelected = updated;
                return updated;
              }
              return f;
            }),
          );
          if (updatedSelected) {
            setSelectedUser(updatedSelected);
          }
        } catch {
          abp.message?.error?.(L("AnErrorOccurred"));
        }
      } else {
        setSelectedUser(chatUser);
      }
      await markAllUnread(chatUser);
    },
    [getFriendOrNull, markAllUnread, chatSvc],
  );

  const reversePinned = useCallback(() => {
    setPinned((p) => {
      LocalStorageHelper.set("app.chat.pinned", !p);
      return !p;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedUser(null);
    LocalStorageHelper.set(
      "app.chat.selectedUser",
      null as unknown as FriendDto,
    );
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      const newValue = !prev;
      LocalStorageHelper.set("app.chat.isOpen", newValue);
      if (newValue) {
        setSelectedUser(null);
        LocalStorageHelper.set(
          "app.chat.selectedUser",
          null as unknown as FriendDto,
        );
      }
      return newValue;
    });
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text || !selectedUser) return;
      const conn = connectionRef.current;
      if (!conn) {
        abp?.notify?.warn?.("Chat is not connected");
        return;
      }
      const tenancyName = tenant?.tenancyName;
      const userName = user?.userName;
      const profilePictureId = user?.profilePictureId;
      try {
        await conn.invoke("sendMessage", {
          tenantId: selectedUser.friendTenantId,
          userId: selectedUser.friendUserId,
          message: text,
          userName,
          tenancyName,
          profilePictureId,
        });
      } catch (e) {
        abp?.log?.error?.(e);
      }
    },
    [selectedUser, user, tenant],
  );

  const reload = useCallback(async () => {
    const res = await chatSvc.getUserChatFriendsWithSettings();
    const list = (res.friends ?? []) as ChatFriend[];

    setFriends((prevFriends) => {
      list.forEach((f) => {
        const existing = prevFriends.find(
          (prev) =>
            prev.friendUserId === f.friendUserId &&
            (prev.friendTenantId ?? null) === (f.friendTenantId ?? null),
        );
        if (existing && existing.messagesLoaded) {
          f.messages = existing.messages;
          f.messagesLoaded = existing.messagesLoaded;
          f.allPreviousMessagesLoaded = existing.allPreviousMessagesLoaded;
        } else {
          f.messagesLoaded = false;
          f.allPreviousMessagesLoaded = false;
          f.messages = [];
        }
      });
      return list;
    });

    const unread = list.reduce(
      (sum, f) => sum + (f.unreadMessageCount ?? 0),
      0,
    );
    setTotalUnreadCount(unread);

    return list;
  }, [chatSvc]);

  useEffect(() => {
    if (initOnceRef.current) {
      return () => {};
    }
    initOnceRef.current = true;
    let mounted = true;
    (async () => {
      const profilePicture = await profileSvc.getProfilePicture();
      if (mounted && profilePicture?.profilePicture) {
        setProfilePicture(
          `data:image/jpeg;base64,${profilePicture.profilePicture}`,
        );
      }
    })();
    return () => {
      mounted = false;
    };
  }, [profileSvc]);

  useEffect(() => {
    LocalStorageHelper.set("app.chat.isOpen", isOpen);
  }, [isOpen]);

  useEffect(() => {
    let mounted = true;
    const onMessage = (
      message: ChatMessageDto & {
        targetUserId?: number;
        targetTenantId?: number | null;
      },
    ) => {
      setFriends((prev) => {
        const copy = [...prev];
        const user = copy.find(
          (f) =>
            f.friendUserId === message.targetUserId &&
            (f.friendTenantId ?? null) === (message.targetTenantId ?? null),
        );
        if (!user) return prev;
        user.messages = user.messages || [];
        user.messages.push(message);
        if (message.side === ChatSide.Receiver) {
          user.unreadMessageCount = (user.unreadMessageCount ?? 0) + 1;
          message.readState = ChatMessageReadState.Unread;
          setTotalUnreadCount((p) => p + 1);
        }
        return copy;
      });
    };
    const onUnread = (count: number) => {
      setTotalUnreadCount(count || 0);
    };
    const onUserConnectNotification = (
      friend: { userId?: number; tenantId?: number | null },
      isConnected: boolean,
    ) => {
      setFriends((prev) => {
        const copy = [...prev];
        const user = copy.find(
          (f) =>
            f.friendUserId === friend?.userId &&
            (f.friendTenantId ?? null) === (friend?.tenantId ?? null),
        );
        if (!user) return prev;
        user.isOnline = isConnected;
        return copy;
      });
      setSelectedUser((prev) => {
        if (
          prev &&
          prev.friendUserId === friend?.userId &&
          (prev.friendTenantId ?? null) === (friend?.tenantId ?? null)
        ) {
          return { ...prev, isOnline: isConnected } as ChatFriend;
        }
        return prev;
      });
    };
    const onUserStateChange = (
      friend: { userId?: number; tenantId?: number | null },
      state: FriendshipState,
    ) => {
      setFriends((prev) => {
        const copy = [...prev];
        const user = copy.find(
          (f) =>
            f.friendUserId === friend?.userId &&
            (f.friendTenantId ?? null) === (friend?.tenantId ?? null),
        );
        if (!user) return prev;
        user.state = state;
        return copy;
      });
      setSelectedUser((prev) => {
        if (
          prev &&
          prev.friendUserId === friend?.userId &&
          (prev.friendTenantId ?? null) === (friend?.tenantId ?? null)
        ) {
          return { ...prev, state } as ChatFriend;
        }
        return prev;
      });
    };

    SignalRHelper.initAbpSignalR({
      onReady: () => {
        try {
          (
            window as Window & { abp?: { signalr?: { connect?: () => void } } }
          ).abp?.signalr?.connect?.();
          (
            window as Window & {
              abp?: {
                signalr?: {
                  startConnection?: (
                    path: string,
                    cb: (connection: HubConnection) => void,
                  ) => Promise<void>;
                };
              };
            }
          ).abp?.signalr
            ?.startConnection?.(
              "/signalr-chat",
              (connection: HubConnection) => {
                const c = connection || null;
                connectionRef.current = c;
                if (c) {
                  c.off("getChatMessage");
                  c.off("setUnreadMessageCount");
                  c.off("getUserStateChange");
                  c.off("getUserConnectNotification");
                  c.on("getChatMessage", onMessage);
                  c.on("setUnreadMessageCount", onUnread);
                  c.on("getUserConnectNotification", onUserConnectNotification);
                  c.on("getUserStateChange", onUserStateChange);
                  c.onreconnecting?.(() => setIsConnected(false));
                  c.onreconnected?.(() => setIsConnected(true));
                  c.onclose?.(() => setIsConnected(false));
                }
              },
            )
            .then(async () => {
              if (!mounted) return;
              setIsConnected(true);
              abp?.event?.trigger?.("app.chat.connected");
              await reload();
              setIsOpen(false);
            })
            .catch(() => {
              abp?.event?.trigger?.("app.chat.disconnected");
              abp?.notify?.warn?.("Chat connection failed");
            });
        } catch {
          abp?.notify?.warn?.("Chat connection failed");
        }
      },
    });

    return () => {
      mounted = false;
      const current = connectionRef.current;
      if (current) {
        current.off("getChatMessage", onMessage);
        current.off("setUnreadMessageCount", onUnread);
        current.off("getUserConnectNotification", onUserConnectNotification);
        current.off("getUserStateChange", onUserStateChange);
      }
      connectionRef.current = null;
    };
  }, [reload]);

  return {
    friends,
    selectedUser,
    isOpen,
    pinned,
    profilePicture,
    userNameFilter,
    setUserNameFilter,
    selectFriend,
    clearSelection,
    reversePinned,
    sendMessage,
    markAllUnread,
    getShownUserName,
    reload,
    isConnected,
    totalUnreadCount,
    toggleOpen,
  };
}
