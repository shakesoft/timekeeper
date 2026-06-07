import { createContext, useContext } from "react";
import type { UseChatState } from "./useChat";

export const ChatContext = createContext<UseChatState | null>(null);

export const useChatContext = (): UseChatState => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return ctx;
};
