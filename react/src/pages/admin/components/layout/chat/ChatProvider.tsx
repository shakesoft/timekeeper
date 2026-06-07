import React from "react";
import { useChat as useChatInternal } from "./hooks/useChat";
import { ChatContext } from "./hooks/useChatContext";

type Props = {
  children: React.ReactNode;
};

export const ChatProvider: React.FC<Props> = ({ children }) => {
  const state = useChatInternal();
  return <ChatContext.Provider value={state}>{children}</ChatContext.Provider>;
};
