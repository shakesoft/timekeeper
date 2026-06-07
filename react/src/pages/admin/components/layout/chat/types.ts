import type {
  ChatMessageDto,
  FriendDto,
} from "../../../../../api/generated/service-proxies";

export type Nullable<T> = T | null | undefined;

export interface ChatFriend extends FriendDto {
  messages?: ChatMessageDto[];
  messagesLoaded?: boolean;
  allPreviousMessagesLoaded?: boolean;
}
